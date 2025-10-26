import { paymentClient } from "../config/mercadopago.js";
import { updateOrderById } from "../services/order.service.js";

const statusMap = {
  approved: "aprobado",
  pending: "pendiente",
  in_process: "en proceso",
  rejected: "rechazado",
  cancelled: "cancelado",
  refunded: "reembolsado",
  charged_back: "reversado",
};

const mapStatus = (status) => statusMap[status] ?? status ?? "pendiente";

export const handleMercadoPagoWebhook = async (req, res, next) => {
  try {
    const topic = req.query.type ?? req.query.topic ?? req.body?.type;
    const action = req.body?.action;

    if (topic !== "payment" && action !== "payment.created") {
      return res.sendStatus(204);
    }

    const paymentId =
      req.query["data.id"] ??
      req.query["id"] ??
      req.body?.data?.id ??
      req.body?.id;

    if (!paymentId) {
      return res.sendStatus(204);
    }

    const payment = await paymentClient.get({
      id: paymentId,
    });

    const {
      status,
      status_detail: statusDetail,
      external_reference: orderId,
      transaction_amount: transactionAmount,
      currency_id: currencyId,
      payer,
      date_approved: dateApproved,
      date_last_updated: dateLastUpdated,
    } = payment;

    if (orderId) {
      await updateOrderById(orderId, {
        estado: mapStatus(status),
        paymentId: payment.id,
        paymentStatus: status,
        paymentStatusDetail: statusDetail,
        paymentInfo: {
          currencyId,
          transactionAmount,
          dateApproved,
          dateLastUpdated,
          payer: {
            email: payer?.email ?? null,
            firstName: payer?.first_name ?? null,
            lastName: payer?.last_name ?? null,
            id: payer?.id ?? null,
          },
        },
      });
    }

    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
