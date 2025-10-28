import api from "../api";

export interface MLConfig {
  _id: string;
  keywordsCount: number;
  topicsCount: number;
  termsPerTopic: number;
  sentimentEnabled: boolean;
  nerEnabled: boolean;
  classificationEnabled: boolean;
  classificationLabels: string[];
  updatedAt: Date;
}

export default new class MLConfigService {
  async getConfig(): Promise<MLConfig> {
    const response = await api.get<MLConfig>("/ml-config");
    return response.data;
  }

  async updateConfig(config: Partial<MLConfig>): Promise<MLConfig> {
    const response = await api.put<MLConfig>("/ml-config", config);
    return response.data;
  }
}
