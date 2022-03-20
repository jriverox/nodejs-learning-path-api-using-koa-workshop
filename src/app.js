const Koa = require('koa');
const json = require('koa-json');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const errorHandler = require('./middleware/error-handler');
const LogManager = require('./utils/logging/log-manager');

const logManager = new LogManager();
const routes = require('./routes');

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa();
// Inicializar los middleware
app.use(bodyParser()).use(json()).use(logger()).use(errorHandler);

routes.forEach((item) => {
  app.use(item.routes()).use(item.allowedMethods());
});

module.exports = app;