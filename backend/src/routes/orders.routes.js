import { Router } from "express";
import {
  confirmOrderPayment,
  getOrder,
  listAllOrders,
  updateOrder,
  cancelOrder,
} from "../controllers/orders.controller.js";

const router = Router();

router.get("/orders", listAllOrders);
router.get("/orders/:orderId", getOrder);
router.patch("/orders/:orderId", updateOrder);
router.post("/orders/:orderId/confirm", confirmOrderPayment);
router.post("/orders/:orderId/cancel", cancelOrder);

export default router;
