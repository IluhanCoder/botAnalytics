import { datasetService } from "./dataset-service";

export const datasetController = {
  async upload(req, res) {
    try {
      const data = req.body;

      if (!data || typeof data !== "object") {
        return res.status(400).json({ message: "Некоректний формат JSON" });
      }

      const saved = await datasetService.saveDataset(data);

      res.json({ success: true, id: saved._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Помилка при збереженні" });
    }
  },

  async getAll(req, res) {
    try {
      const datasets = await datasetService.getAllDatasets();
      res.json({datasets});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Помилка при отриманні даних" });
    }
  },

  async saveAnalysis(req, res) {
    try {
      const datasetId = req.params.id;
      const { result } = req.body;

      if (!datasetId) return res.status(400).json({ message: "Missing dataset id" });
      if (!result || !Array.isArray(result))
        return res.status(400).json({ message: "Invalid result payload" });

      const saved = await datasetService.saveAnalysis(datasetId, result);

      res.json({ success: true, id: saved._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Помилка при збереженні результатів" });
    }
  },

  async getWithAnalytics(req, res) {
    try {
      const datasets = await datasetService.getDatasetsWithAnalytics();
      res.json({ datasets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Помилка при отриманні датасетів з аналітикою" });
    }
  },

  async getAnalyses(req, res) {
    try {
      const datasetId = req.params.id;
      if (!datasetId) return res.status(400).json({ message: "Missing dataset id" });

      const analyses = await datasetService.getAnalyses(datasetId);
      res.json({ success: true, analyses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Помилка при отриманні результатів" });
    }
  },
};
