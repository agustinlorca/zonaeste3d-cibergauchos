import config from "../config/env.js";
import { preferenceClient } from "../config/mercadopago.js";
import { createOrder, updateOrderById } from "../services/order.service.js";
import { checkoutSchema } from "../schemas/checkout.schema.js";

const buildBackUrls = (frontendBaseUrl, orderId) => {
  const base = frontendBaseUrl.endsWith("/")
    ? frontendBaseUrl.slice(0, -1)
    : frontendBaseUrl;

  return {
    success: `${base}/order/${orderId}?status=approved`,
    failure: `${base}/order/${orderId}?status=failure`,
    pending: `${base}/order/${orderId}?status=pending`,
  };
};

const mapItemsForPreference = (items) =>
  items.map((item) => ({
    id: item.id,
    title: item.nombre,
    description: item.nombre,
    quantity: item.cantidad,
    currency_id: "ARS",
    unit_price: Number(item.precio),
  }));

const mapItemsForOrder = (items) =>
  items.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    precio: Number(item.precio),
    cantidad: Number(item.cantidad),
    subtotal: Number(item.precio) * Number(item.cantidad),
    imgUrl: item.imgUrl ?? null,
  }));

export const createCheckout = async (req, res, next) => {
  let orderId;

  try {
    const payload = checkoutSchema.parse(req.body);

    const orderItems = mapItemsForOrder(payload.items);
    const total = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    const cantidadProductos = orderItems.reduce(
      (acc, item) => acc + item.cantidad,
      0
    );

    const order = await createOrder({
      buyer: payload.buyer ?? null,
      items: orderItems,
      cantidadProductos,
      total,
      estado: "pendiente",
      preferenceId: null,
      initPoint: null,
      sandboxInitPoint: null,
    });

    orderId = order.id;

    const backUrls = buildBackUrls(config.urls.frontend, orderId);
    const preferenceBody = {
      items: mapItemsForPreference(payload.items),
      back_urls: backUrls,
      external_reference: orderId,
      notification_url: `${config.urls.backend}/api/mercadopago/webhook`,
      metadata: {
        orderId,
      },
      statement_descriptor: "ZonaEste3D",
      payment_methods: {
        excluded_payment_methods: [],
      },
    };

    if (config.urls.frontend.startsWith("https://")) {
      preferenceBody.auto_return = "approved";
    }

    const preferenceResponse = await preferenceClient.create({
      body: preferenceBody,
    });

    await updateOrderById(orderId, {
      preferenceId: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
    });

    res.status(201).json({
      orderId,
      preferenceId: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
    });
  } catch (error) {
    if (orderId) {
      await updateOrderById(orderId, {
        estado: "error",
        checkoutErrorMessage: error.message,
      });
    }

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Error de validacion",
        errors: error.errors,
      });
    }
    return next(error);
  }
};
