import { firestore } from "../config/firebase.js";
import {
  getOrderById,
  listOrders,
  updateOrderById,
} from "../services/order.service.js";

const PRODUCTS_COLLECTION = "products";
const ORDER_STATUSES = [
  "pendiente",
  "pagado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];

const timestampToIsoString = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
};

const mapOrderForResponse = (order) => ({
  id: order.id,
  buyer: order.buyer ?? null,
  items: order.items ?? [],
  cantidadProductos: order.cantidadProductos ?? 0,
  total: order.total ?? 0,
  estado: order.estado ?? "pendiente",
  paymentStatus: order.paymentStatus ?? null,
  paymentStatusDetail: order.paymentStatusDetail ?? null,
  paymentConfirmed: Boolean(order.paymentConfirmed),
  fulfillmentStatus: order.fulfillmentStatus ?? "pendiente",
  shipping: order.shipping ?? null,
  preferenceId: order.preferenceId ?? null,
  initPoint: order.initPoint ?? null,
  sandboxInitPoint: order.sandboxInitPoint ?? null,
  fecha: timestampToIsoString(order.fecha),
  updatedAt: timestampToIsoString(order.updatedAt),
});

export const getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    return res.json(mapOrderForResponse(order));
  } catch (error) {
    return next(error);
  }
};

export const listAllOrders = async (req, res, next) => {
  try {
    const { status, from, to, search } = req.query;
    const normalizedStatus = status?.toString().trim().toLowerCase();
    const searchTerm = search?.toString().trim().toLowerCase();
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const orders = await listOrders();

    const filtered = orders.filter((order) => {
      let include = true;

      if (
        normalizedStatus &&
        normalizedStatus !== "todos" &&
        normalizedStatus !== "all"
      ) {
        include =
          include &&
          (order.fulfillmentStatus?.toLowerCase?.() ?? "pendiente") ===
            normalizedStatus;
      }

      if (include && (fromDate || toDate)) {
        const orderDate =
          typeof order.fecha?.toDate === "function"
            ? order.fecha.toDate()
            : null;

        if (fromDate) {
          include = include && orderDate && orderDate >= fromDate;
        }

        if (toDate) {
          const endOfDay = new Date(
            toDate.getFullYear(),
            toDate.getMonth(),
            toDate.getDate(),
            23,
            59,
            59,
            999
          );
          include = include && orderDate && orderDate <= endOfDay;
        }
      }

      if (include && searchTerm) {
        const matchesId = order.id?.toLowerCase?.().includes(searchTerm);
        const matchesEmail = order.buyer?.email
          ?.toLowerCase?.()
          ?.includes(searchTerm);
        include = matchesId || matchesEmail;
      }

      return include;
    });

    const response = filtered.map(mapOrderForResponse);

    return res.json({
      orders: response,
      total: response.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const confirmOrderPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (order.paymentConfirmed) {
      return res.json({
        message: "La orden ya fue confirmada anteriormente",
        paymentConfirmed: true,
      });
    }

    const batch = firestore.batch();
    let hasUpdates = false;

    for (const item of order.items ?? []) {
      if (!item?.id) {
        continue;
      }

      const quantity = Number(item.cantidad ?? item.qty ?? item.quantity ?? 0);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        continue;
      }

      const productRef = firestore.collection(PRODUCTS_COLLECTION).doc(item.id);
      const productSnapshot = await productRef.get();

      if (!productSnapshot.exists) {
        continue;
      }

      const currentStock = Number(productSnapshot.get("stock") ?? 0);
      const safeStock = Number.isFinite(currentStock) ? currentStock : 0;
      const updatedStock = safeStock - quantity;

      batch.update(productRef, {
        stock: updatedStock > 0 ? updatedStock : 0,
      });
      hasUpdates = true;
    }

    if (hasUpdates) {
      await batch.commit();
    }

    const updates = {
      estado: "aprobado",
      paymentStatus: "approved",
      paymentStatusDetail: "manual_confirmation",
      paymentConfirmed: true,
    };

    const currentStatus = order.fulfillmentStatus ?? "pendiente";
    if (["pendiente", "pagado"].includes(currentStatus)) {
      updates.fulfillmentStatus = "pagado";
    }

    await updateOrderById(orderId, updates);

    return res.json({
      message: "Orden confirmada exitosamente",
      paymentConfirmed: true,
      stockUpdated: hasUpdates,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { fulfillmentStatus } = req.body ?? {};

    if (fulfillmentStatus) {
      const normalized = fulfillmentStatus.toString().trim().toLowerCase();

      if (!ORDER_STATUSES.includes(normalized)) {
        return res.status(400).json({
          message: "Estado de orden invalido",
          allowedStatuses: ORDER_STATUSES,
        });
      }

      await updateOrderById(orderId, {
        fulfillmentStatus: normalized,
      });
    }

    const updatedOrder = await getOrderById(orderId);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    return res.json(mapOrderForResponse(updatedOrder));
  } catch (error) {
    return next(error);
  }
};
