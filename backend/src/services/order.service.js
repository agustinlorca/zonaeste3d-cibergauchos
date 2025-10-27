import { FieldValue, firestore } from "../config/firebase.js";

const ORDERS_COLLECTION = "orders";

export const createOrder = async ({
  orderId,
  buyer,
  items,
  cantidadProductos,
  total,
  estado,
  fulfillmentStatus,
  preferenceId,
  initPoint,
  sandboxInitPoint,
  shipping,
}) => {
  const orderRef = orderId
    ? firestore.collection(ORDERS_COLLECTION).doc(orderId)
    : firestore.collection(ORDERS_COLLECTION).doc();
  const orderPayload = {
    buyer: buyer ?? null,
    items,
    cantidadProductos,
    total,
    estado,
    fulfillmentStatus: fulfillmentStatus ?? "pendiente",
    preferenceId,
    initPoint,
    sandboxInitPoint,
    shipping: shipping ?? null,
    fecha: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    paymentConfirmed: false,
  };

  await orderRef.set(orderPayload);

  return {
    id: orderRef.id,
    data: orderPayload,
  };
};

export const getOrderById = async (orderId) => {
  const snapshot = await firestore
    .collection(ORDERS_COLLECTION)
    .doc(orderId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const updateOrderById = async (orderId, updates) => {
  const orderRef = firestore.collection(ORDERS_COLLECTION).doc(orderId);

  await orderRef.set(
    {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

export const listOrders = async () => {
  const snapshot = await firestore
    .collection(ORDERS_COLLECTION)
    .orderBy("fecha", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
