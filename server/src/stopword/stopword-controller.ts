import { Request, Response } from "express";
import stopwordService from "./stopword-service";
import { loadCustomStopwords, defaultStopwords, toggleDefaultStopword, getDisabledStopwords } from "../utils/text-processing";

export default new class StopwordController {
    async createStopword(req: Request, res: Response) {
        try {
            const {content} = req.body;
            await stopwordService.createStopword(content);
            // Reload stopwords after adding new one
            await loadCustomStopwords();
            return res.status(200).json({ stopword: "success" });
        } catch (error) {
          console.log(error);
          res.status(400).json({ stopword: error.stopword });
        }
    }

    async deleteStopwordById(req: Request, res: Response) {
        try {
            const {id} = req.params;
            await stopwordService.deleteStopwordById(id);
            // Reload stopwords after deletion
            await loadCustomStopwords();
            return res.status(200).json({ stopword: "success" });
        } catch (error) {
            console.log(error);
            res.status(400).json({ stopword: error.stopword });
        }
    }

    async getStopwords(req: Request, res: Response) {
        try {
            const stopwords = await stopwordService.fetchStopwords();
            return res.status(200).json({stopwords});
        } catch (error) {
            console.log(error);
            res.status(400).json({ stopword: error.stopword });
        }
    }

    // Get default (built-in) stopwords
    async getDefaultStopwords(req: Request, res: Response) {
        try {
            const disabled = getDisabledStopwords();
            return res.status(200).json({ 
                defaultStopwords,
                disabledStopwords: disabled 
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: error.message });
        }
    }

    // Toggle default stopword on/off
    async toggleDefaultStopword(req: Request, res: Response) {
        try {
            const { word, enabled } = req.body;
            toggleDefaultStopword(word, enabled);
            return res.status(200).json({ message: "success" });
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: error.message });
        }
    }
}