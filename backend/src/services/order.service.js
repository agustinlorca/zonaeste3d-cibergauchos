import { FieldValue, firestore } from "../config/firebase.js";

const ORDERS_COLLECTION = "orders";

export const createOrder = async ({
  orderId,
  buyer,
  items,
  cantidadProductos,
  total,
  estado,
  preferenceId,
  initPoint,
  sandboxInitPoint,
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
    preferenceId,
    initPoint,
    sandboxInitPoint,
    fecha: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
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
