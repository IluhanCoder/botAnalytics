import Sentiment from "sentiment";
import natural from "natural";
import lda from "lda";
import rake from "node-rake";
import { preprocess } from "../utils/text-processing";
import { AnalyticsResponse } from "./../../../shared/types/dataset-types";
import { pipeline, env } from "@xenova/transformers";
import mlConfigService from "../ml-config/ml-config-service";

export class AnalysisService {
  private nerModel: any = null;
  private classifierModel: any = null;

  constructor() {
    env.allowLocalModels = true;
    env.allowRemoteModels = true;
    env.cacheDir = "./models";
  }

  // Lazy load models only when needed to save memory
  private async getNerModel() {
    if (!this.nerModel) {
      console.log('🔄 Loading NER model...');
      this.nerModel = await pipeline("token-classification", "Xenova/bert-base-NER");
      console.log('✅ NER model loaded');
    }
    return this.nerModel;
  }

  private async getClassifierModel() {
    if (!this.classifierModel) {
      console.log('🔄 Loading Classifier model...');
      this.classifierModel = await pipeline("zero-shot-classification", "Xenova/bart-large-mnli");
      console.log('✅ Classifier model loaded');
    }
    return this.classifierModel;
  }

  // Detect if text is Ukrainian (simple heuristic)
  private isUkrainian(text: string): boolean {
    const ukrainianChars = /[іїєґ]/i;
    return ukrainianChars.test(text);
  }

  // Generate hardcoded demo results for Ukrainian text
  private generateDemoResults(text: string): AnalyticsResponse {
    const cleaned = preprocess(text);
    const words = cleaned.split(' ').filter(w => w.length > 0);
    
    // Demo sentiment based on simple keywords
    let sentimentScore = 0;
    const positiveWords = ['добре', 'чудово', 'відмінно', 'хороший', 'позитивн', 'успіх', 'радість'];
    const negativeWords = ['погано', 'жахливо', 'поганий', 'негативн', 'проблем', 'помилк'];
    
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) sentimentScore += 2;
    });
    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) sentimentScore -= 2;
    });

    // Demo keywords - just take first words
    const keywords = words.slice(0, Math.min(10, words.length));

    // Demo entities - find capitalized words
    const entities = text.split(' ')
      .filter(word => word.length > 2 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase())
      .slice(0, 3)
      .map(word => ({ entity: 'ORG', text: word.replace(/[^\p{L}]/gu, '') }));

    // Demo topics
    const topics = [
      { topic: 0, words: keywords.slice(0, 5) },
      { topic: 1, words: keywords.slice(5, 10) }
    ];

    // Demo category based on keywords
    let category = 'Загальне';
    if (text.toLowerCase().includes('технолог') || text.toLowerCase().includes('комп\'ютер')) {
      category = 'Технології';
    } else if (text.toLowerCase().includes('політик') || text.toLowerCase().includes('уряд')) {
      category = 'Політика';
    } else if (text.toLowerCase().includes('спорт') || text.toLowerCase().includes('футбол')) {
      category = 'Спорт';
    } else if (text.toLowerCase().includes('здоров') || text.toLowerCase().includes('медицин')) {
      category = 'Здоров\'я';
    }

    return {
      text,
      cleaned,
      tokens: words,
      stemmed: words,
      sentiment: {
        score: sentimentScore,
        comparative: words.length > 0 ? sentimentScore / words.length : 0,
      },
      topics,
      entities,
      keywords,
      keyPhrases: keywords.slice(0, 5),
      category: `${category} (демо)`,
    };
  }

  // 😊 Sentiment analysis
  private sentimentAnalyzer = new Sentiment();

  // 🧩 TF-IDF keywords
  private getKeywords(text: string, topN = 10): string[] {
    try {
      if (!text || text.trim().length === 0) return [];
      const tfidf = new natural.TfIdf();
      tfidf.addDocument(text);

      const terms: string[] = [];
      tfidf.listTerms(0).slice(0, topN).forEach((item) => {
        terms.push(item.term);
      });

      return terms;
    } catch (error) {
      console.error('TF-IDF error:', error);
      return [];
    }
  }

  // 🔑 RAKE key phrases
  private getKeyPhrases(text: string): string[] {
    try {
      if (!text || text.trim().length === 0) return [];
      const result = rake.generate(text);
      return result || [];
    } catch (error) {
      console.error('RAKE error:', error);
      return [];
    }
  }

  // Tokenize text
  private tokenize(text: string): string[] {
    try {
      if (!text || text.trim().length === 0) return [];
      const tokenizer = new natural.WordTokenizer();
      return tokenizer.tokenize(text) || [];
    } catch (error) {
      console.error('Tokenization error:', error);
      return [];
    }
  }

  // Stem words
  private stem(tokens: string[]): string[] {
    try {
      if (!tokens || tokens.length === 0) return [];
      const stemmer = natural.PorterStemmer;
      return tokens.map(token => stemmer.stem(token));
    } catch (error) {
      console.error('Stemming error:', error);
      return [];
    }
  }

  // Sentiment analysis wrapper
  private analyzeSentiment(text: string) {
    try {
      if (!text || text.trim().length === 0) return { score: 0, comparative: 0 };
      return this.sentimentAnalyzer.analyze(text);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { score: 0, comparative: 0 };
    }
  }

  // NER wrapper
  private async extractEntities(text: string) {
    try {
      if (!text || text.trim().length === 0) return [];
      const ner = await this.getNerModel();
      const result = await ner(text);
      return this.formatEntities(result);
    } catch (error) {
      console.error('NER error:', error);
      return [];
    }
  }

  // Classification wrapper
  private async classifyText(text: string, labels: string[]): Promise<string> {
    try {
      if (!text || text.trim().length === 0) return "Unknown";
      if (!labels || labels.length === 0) return "Unknown";
      const classifier = await this.getClassifierModel();
      const result: any = await classifier(text, labels);
      return result.labels[0];
    } catch (error) {
      console.error('Classification error:', error);
      return "Unknown";
    }
  }

  private formatEntities(entities) {
    const formatted = [];
    let current = null;

    for (const item of entities) {
      const label = item.entity.replace(/^B-|^I-/, "") as string;
      const word = item.word.replace(/^##/, "") as string;

      if (item.entity.startsWith("B-")) {
        if (current) formatted.push(current);
        current = { entity: label, text: word };
      } else if (item.entity.startsWith("I-") && current && current.entity === label) {
        current.text += item.word.startsWith("##") ? word : " " + word;
      } else {
        if (current) formatted.push(current);
        current = null;
      }
    }

    if (current) formatted.push(current);
    return formatted;
  }

  async analyze(text: string): Promise<AnalyticsResponse> {
    try {
      // Ensure text is a string
      if (typeof text !== 'string') {
        console.error('Invalid text type:', typeof text, text);
        text = String(text || '');
      }

      // Check if text is Ukrainian - use demo mode
      if (this.isUkrainian(text)) {
        console.log('Ukrainian text detected - using demo mode');
        return this.generateDemoResults(text);
      }

      // English text - use real ML models
      console.log('English text detected - using ML models');
      const config = await mlConfigService.getConfig();
      
      // For free tier with low memory - use lightweight mode
      const isLowMemory = process.env.LOW_MEMORY_MODE === 'true' || process.env.NODE_ENV === 'production';

      const cleaned = preprocess(text);
      const tokens = this.tokenize(cleaned);
      const stemmed = this.stem(tokens);

      const sentiment = config.sentimentEnabled ? this.analyzeSentiment(cleaned) : { score: 0, comparative: 0 };
      
      let topics = [];
      try {
        const ldaResult = lda([cleaned], config.topicsCount, config.termsPerTopic);
        // LDA returns array of arrays: [[{term, probability}], [{term, probability}]]
        topics = ldaResult.map((topicWords: any, index: number) => ({
          topic: index,
          words: topicWords, // Already array of {term, probability}
        }));
      } catch (error) {
        console.error('LDA error:', error);
        topics = [];
      }

      // Only load heavy models if not in low memory mode AND enabled in config
      const entities = (!isLowMemory && config.nerEnabled) ? await this.extractEntities(text) : [];
      const keywords = this.getKeywords(cleaned, config.keywordsCount);
      const keyPhrases = this.getKeyPhrases(text);
      const category = (!isLowMemory && config.classificationEnabled) ? await this.classifyText(text, config.classificationLabels) : "Unknown (low memory mode)";

      if (isLowMemory) {
        console.log('⚠️ LOW_MEMORY_MODE: Skipping heavy ML models (NER, Classification)');
      }

      return {
        text,
        cleaned,
        tokens,
        stemmed,
        sentiment,
        topics,
        entities,
        keywords,
        keyPhrases,
        category,
      };
    } catch (error) {
      console.error('Analysis error:', error);
      // Return minimal valid response on error
      return {
        text: String(text || ''),
        cleaned: '',
        tokens: [],
        stemmed: [],
        sentiment: { score: 0, comparative: 0 },
        topics: [],
        entities: [],
        keywords: [],
        keyPhrases: [],
        category: 'Error',
      };
    }
  }
  
}

export default new AnalysisService();
