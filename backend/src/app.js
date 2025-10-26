import cors from "cors";
import express from "express";
import morgan from "morgan";
import config from "./config/env.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (
      config.cors.allowedOrigins.length === 0 ||
      config.cors.allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error("Origen no permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", checkoutRoutes);
app.use("/api", ordersRoutes);
app.use("/api", webhookRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const statusCode = err.statusCode ?? 500;
  res
    .status(statusCode)
    .json({ message: err.message ?? "Error interno del servidor" });
});

export default app;
