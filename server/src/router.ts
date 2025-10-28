import { Router } from "express";
import authRouter from "./auth/auth-router";
import authMiddleware from "./auth/auth-middleware";
import adminMiddleware from "./auth/admin-middleware";
import stopwordController from "./stopword/stopword-controller";
import userController from "./user/user-controller";
import { datasetController } from "./dataset/dataset-controller";
import analyticsController from "./analytics/analytics-controller";
import mlConfigController from "./ml-config/ml-config-controller";

const router = Router();

router.use('/auth', authRouter);
router.use(authMiddleware);
router.post("/stopword", adminMiddleware, stopwordController.createStopword);
router.delete("/stopword/:id", adminMiddleware, stopwordController.deleteStopwordById);
router.get("/stopword", stopwordController.getStopwords);
router.get("/stopword/default/list", stopwordController.getDefaultStopwords);
router.post("/stopword/default/toggle", adminMiddleware, stopwordController.toggleDefaultStopword);

router.get("/user/id", userController.getUserId);
router.get("/profile", userController.getProfile);

// Admin-only routes
router.get("/admin/users", adminMiddleware, userController.getAllUsers);
router.delete("/admin/users/:userId", adminMiddleware, userController.deleteUser);
router.put("/admin/users/:userId/role", adminMiddleware, userController.updateUserRole);

// ML Config routes
router.get("/ml-config", mlConfigController.getConfig);
router.put("/ml-config", adminMiddleware, mlConfigController.updateConfig);

router.post("/dataset/upload", datasetController.upload);
router.get("/dataset", datasetController.getAll);
router.post("/dataset/:id/analytics", datasetController.saveAnalysis);
router.get("/dataset/with-analytics", datasetController.getWithAnalytics);
router.get("/dataset/:id/analytics", datasetController.getAnalyses);

router.post("/analytics/run", analyticsController.runAnalysis);

export default router;