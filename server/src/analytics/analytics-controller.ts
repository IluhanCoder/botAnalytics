import { Request, Response } from "express";
import analyticsService from "./analytics-service";
import { DatasetModel } from "../dataset/dataset-model";
import { loadCustomStopwords } from "../utils/text-processing";

class AnalysisController {
  async runAnalysis(req: Request, res: Response) {
    try {
      const { datasetId } = req.body;
      const dataset = await DatasetModel.findById(datasetId);

      if (!dataset) return res.status(404).json({ message: "Dataset not found" });

      // Load custom stopwords from database before analysis
      await loadCustomStopwords();

      // dataset.content is an array of objects with 'content' field
      const dataArray = Array.isArray(dataset.content) ? dataset.content : [dataset.content];
      
      console.log(`Processing ${dataArray.length} items from dataset`);
      
      const results = [];
      for (const item of dataArray) {
        // Extract text from the item
        const text = typeof item === 'string' ? item : (item.content || item.text || JSON.stringify(item));
        console.log(`Analyzing text: ${text.substring(0, 50)}...`);
        const result = await analyticsService.analyze(text);
        results.push(result);
      }

      res.json({ success: true, result: results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new AnalysisController();
