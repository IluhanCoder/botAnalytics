import MLConfigModel, { IMLConfig } from "./ml-config-model";

export default new class MLConfigService {
  async getConfig(): Promise<IMLConfig> {
    let config = await MLConfigModel.findOne();
    
    // Create default config if doesn't exist
    if (!config) {
      config = new MLConfigModel({
        keywordsCount: 10,
        topicsCount: 2,
        termsPerTopic: 5,
        sentimentEnabled: true,
        nerEnabled: true,
        classificationEnabled: true,
        classificationLabels: ["Technology", "Finance", "Sports", "Politics", "Health", "Entertainment", "General"]
      });
      await config.save();
    }
    
    return config;
  }

  async updateConfig(updates: Partial<IMLConfig>): Promise<IMLConfig> {
    let config = await MLConfigModel.findOne();
    
    if (!config) {
      config = new MLConfigModel(updates);
    } else {
      Object.assign(config, updates);
      config.updatedAt = new Date();
    }
    
    await config.save();
    return config;
  }
}
