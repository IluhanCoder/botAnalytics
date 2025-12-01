import Sentiment from "sentiment";
import natural from "natural";
import lda from "lda";
import rake from "node-rake";
import { preprocess } from "../utils/text-processing";
import { AnalyticsResponse } from "./../../../shared/types/dataset-types";
import { extractEntities } from "../utils/ner";
import mlConfigService from "../ml-config/ml-config-service";

export class AnalysisService {
  constructor() {
    console.log('✅ AnalysisService initialized (lightweight mode)');
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

  // NER wrapper using compromise (lightweight)
  private extractEntitiesLight(text: string) {
    try {
      if (!text || text.trim().length === 0) return [];
      const result = extractEntities(text);
      
      // Convert to format expected by frontend
      const formatted = [];
      if (result.persons) {
        result.persons.forEach(person => {
          formatted.push({ entity: 'PER', text: person });
        });
      }
      if (result.organizations) {
        result.organizations.forEach(org => {
          formatted.push({ entity: 'ORG', text: org });
        });
      }
      
      return formatted;
    } catch (error) {
      console.error('NER error:', error);
      return [];
    }
  }

  // Classification using keyword matching (lightweight)
  private classifyTextLight(text: string, labels: string[]): string {
    try {
      if (!text || text.trim().length === 0) return "General";
      if (!labels || labels.length === 0) return "General";
      
      const lowerText = text.toLowerCase();
      
      // Category keyword mappings
      const categoryKeywords: Record<string, string[]> = {
        'Technology': ['tech', 'computer', 'software', 'hardware', 'ai', 'machine learning', 'programming', 'code', 'internet', 'digital', 'cyber', 'app', 'mobile', 'website'],
        'Politics': ['politic', 'government', 'election', 'president', 'minister', 'parliament', 'law', 'policy', 'vote', 'democracy', 'republican', 'democrat'],
        'Sports': ['sport', 'football', 'soccer', 'basketball', 'tennis', 'game', 'player', 'team', 'championship', 'olympic', 'athlete', 'coach'],
        'Business': ['business', 'company', 'market', 'stock', 'finance', 'economy', 'trade', 'investment', 'profit', 'sales', 'corporate', 'startup'],
        'Entertainment': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'singer', 'concert', 'show', 'series', 'netflix', 'hollywood'],
        'Health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'patient', 'therapy', 'clinic', 'vaccine'],
        'Science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment', 'theory', 'laboratory', 'physics', 'chemistry', 'biology'],
        'Education': ['education', 'school', 'university', 'student', 'teacher', 'learning', 'course', 'study', 'academic', 'college', 'professor']
      };
      
      // Score each category
      let bestCategory = 'General';
      let bestScore = 0;
      
      for (const label of labels) {
        const keywords = categoryKeywords[label] || [];
        let score = 0;
        
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            score += 1;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestCategory = label;
        }
      }
      
      return bestCategory;
    } catch (error) {
      console.error('Classification error:', error);
      return "General";
    }
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

      // English text - use lightweight algorithms
      console.log('English text detected - using lightweight mode');
      const config = await mlConfigService.getConfig();

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

      // Use lightweight algorithms instead of heavy ML models
      const entities = config.nerEnabled ? this.extractEntitiesLight(text) : [];
      const keywords = this.getKeywords(cleaned, config.keywordsCount);
      const keyPhrases = this.getKeyPhrases(text);
      const category = config.classificationEnabled ? this.classifyTextLight(text, config.classificationLabels) : "General";

      console.log('✅ Analysis completed with lightweight algorithms');

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
