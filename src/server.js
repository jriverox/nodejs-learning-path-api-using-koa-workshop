/* eslint-disable no-console */
/**
 * server.js
 * Responsable por inciar nuestra api, inicializa koa con todos sus middleware y tambien inicialzia la conexión de bd
 */
 const Koa = require('koa');
 const json = require('koa-json');
 const logger = require('koa-logger');
 const bodyParser = require('koa-bodyparser');
 const yenv = require('yenv');
 const mongoose = require('mongoose');
 
 const env = yenv();
 const routes = require('./routes');
 
 // Inicializar nuestro servidor usando koa (similar a express)
 const app = new Koa();
 // Inicializar los middleware
 app.use(bodyParser()).use(json()).use(logger());
 
 // eslint-disable-next-line array-callback-return
 routes.map((item) => {
   app.use(item.routes()).use(item.allowedMethods());
 });
 // abrir la conexión con MongoDB
 mongoose
   .connect(env.MONGODB_URL, { useNewUrlParser: true })
   .then(() => {
     // iniciar el servidor koa para que empiece a escuchar peticiones
     app.listen(env.PORT, () => {
       console.log(`Escuchando en el puerto ${env.PORT}`);
     });
   })
   .catch((error) => {
     console.error(error);
   });
 