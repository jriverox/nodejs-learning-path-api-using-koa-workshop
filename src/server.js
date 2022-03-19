const Koa = require('koa');
const json = require('koa-json');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const yenv = require('yenv');
const mongoose = require('mongoose');
// linea agregada en este paso: referenciar al middleware que manejará los errores
const errorHandler = require('./middleware/error-handler');
// linea agregada en este paso: referenciar a la clase LogManager
const LogManager = require('./utils/logging/log-manager');
// linea agregada en este paso: instanciar el LogManager
const logManager = new LogManager();

const env = yenv();
const routes = require('./routes');

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa();
// linea agregada en este paso: agregar .use(apiError) para usar el middleware de manejo de errores en todas las solicitudes
app.use(bodyParser()).use(json()).use(logger()).use(errorHandler);

routes.forEach((item) => {
  app.use(item.routes()).use(item.allowedMethods());
});

// linea agregada en este paso: centralizar el manejo de errores con este evento
// eslint-disable-next-line no-unused-vars
app.on('error', (err, ctx) => {
  const isOperationalError = logManager.error(err);
  if (!isOperationalError) {
    process.exit(1);
  }
});

// abrir la conexión con MongoDB
mongoose
  .connect(env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => {
    // iniciar el servidor koa para que empiece a escuchar peticiones
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Escuchando en el puerto ${env.PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
