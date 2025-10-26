import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import config from "./env.js";

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: config.mercadoPago.accessToken,
  options: {
    timeout: 5000,
  },
});

const preferenceClient = new Preference(mercadoPagoClient);
const paymentClient = new Payment(mercadoPagoClient);

export { mercadoPagoClient, preferenceClient, paymentClient };
