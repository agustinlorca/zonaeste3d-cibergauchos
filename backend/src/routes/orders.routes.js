import { Router } from "express";
import { getOrder } from "../controllers/orders.controller.js";

const router = Router();

router.get("/orders/:orderId", getOrder);

export default router;
