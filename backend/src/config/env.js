import "dotenv/config";

const requiredEnvVars = [
  "MP_ACCESS_TOKEN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FRONTEND_URL",
];

const missing = requiredEnvVars.filter(
  (key) => process.env[key] === undefined || process.env[key] === ""
);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `Faltan variables de entorno requeridas: ${missing.join(", ")}`
  );
  throw new Error("Configuracion invalida. Verifica el archivo .env");
}

const parseOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const normalizeUrl = (value) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const allowedOrigins = parseOrigins(process.env.FRONTEND_URL);
const primaryFrontendUrl = normalizeUrl(allowedOrigins[0] ?? process.env.FRONTEND_URL);

const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number.isNaN(port) ? 3000 : port,
  cors: {
    allowedOrigins,
  },
  urls: {
    frontend: primaryFrontendUrl,
    backend: normalizeUrl(
      process.env.BACKEND_URL ?? `http://localhost:${port || 3000}`
    ),
  },
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
};

export default config;
