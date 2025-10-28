import api from '../api';
import { AnalyticsPostResponse, AnalyticsResponse, DatasetFetchResponse, DatasetResponse } from './../../../shared/types/dataset-types';
export default new class DatasetService {
    async fetchDatasets(): Promise<DatasetResponse[]> {
        const result = (await api.get("/dataset")).data as DatasetFetchResponse;
        return result.datasets;
    }

    async postDataset(file) {
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);

            await api.post("/dataset/upload", jsonData); // <— відправляємо як JSON
        } catch (err) {
            throw err;
        }
    }

    async runAnalytics(datasetId: string): Promise<AnalyticsResponse[]> {
        const res = (await api.post("/analytics/run", {
            datasetId: datasetId,
        })).data as AnalyticsPostResponse;
        return res.result;
    }

    async saveAnalysis(datasetId: string, result: AnalyticsResponse[]) {
        const res = (await api.post(`/dataset/${datasetId}/analytics`, { result })).data as { success: boolean, id: string };
        return res;
    }

    async fetchDatasetsWithAnalytics(): Promise<DatasetResponse[]> {
        const result = (await api.get("/dataset/with-analytics")).data as DatasetFetchResponse;
        return result.datasets;
    }

    async fetchAnalyses(datasetId: string) {
        const res = (await api.get(`/dataset/${datasetId}/analytics`)).data as { success: boolean, analyses: any[] };
        return res.analyses;
    }
}