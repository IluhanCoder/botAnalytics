import { Request, Response } from "express";
import mlConfigService from "./ml-config-service";

export default new class MLConfigController {
  async getConfig(req: Request, res: Response) {
    try {
      const config = await mlConfigService.getConfig();
      res.status(200).json(config);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get ML config" });
    }
  }

  async updateConfig(req: Request, res: Response) {
    try {
      const updates = req.body;
      const config = await mlConfigService.updateConfig(updates);
      res.status(200).json(config);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update ML config" });
    }
  }
}
