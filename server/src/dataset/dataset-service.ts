import { DatasetModel } from "./dataset-model";
import AnalyticsResultModel from "../analytics/analytics-result-model";

export const datasetService = {
  async saveDataset(data) {
    const dataset = new DatasetModel({
      uploadedAt: new Date(),
      content: data,
    });
    return await dataset.save();
  },

  async saveAnalysis(datasetId: string, result: any[]) {
    // create analytics result document and link it to dataset
    const saved = await AnalyticsResultModel.create({ result, dataset: datasetId });

    // push reference into dataset.analyticsResults
    await DatasetModel.findByIdAndUpdate(datasetId, { $push: { analyticsResults: saved._id } });

    return saved;
  },

  async getAllDatasets() {
    return await DatasetModel.find().sort({ uploadedAt: -1 });
  },

  async getDatasetsWithAnalytics() {
    // return datasets that have at least one analyticsResults reference
    return await DatasetModel.find({ analyticsResults: { $exists: true, $ne: [] } }).sort({ uploadedAt: -1 });
  },

  async getAnalyses(datasetId: string) {
    // return analytics result documents for a given dataset
    return await AnalyticsResultModel.find({ dataset: datasetId }).sort({ createdAt: -1 });
  },
};
