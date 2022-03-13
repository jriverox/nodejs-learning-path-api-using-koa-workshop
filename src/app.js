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
 
 // eslint-disable-next-line array-callback-return
 routes.map((item) => {
   app.use(item.routes()).use(item.allowedMethods());
 });
 
 // linea agregada en este paso: centralizar el manejo de errores con este evento
 // eslint-disable-next-line no-unused-vars
 app.on('error', (err, ctx) => {
   // eslint-disable-next-line no-console
   console.error('logging error');
   const isOperationalError = logManager.error(err);
   if (!isOperationalError) {
     process.exit(1);
   }
 });
 
module.exports = app;
