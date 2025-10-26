import { getOrderById } from "../services/order.service.js";

export const getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
};
