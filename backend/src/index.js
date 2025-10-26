import app from "./app.js";
import config from "./config/env.js";

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en el puerto ${config.port}`);
});
