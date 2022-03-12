# Episodio 4: Implementando el manejo de errores

Para el manejo de errores, usaremos la librería [winston](https://www.npmjs.com/package/winston) para logear los errores, aunque podriamos usar cualquier otra librería esto de hecho no es lo más relevante, ya que lo importante es manejar de manera centralizada los errores e incluso disponer de nuetra lógica de negocio para gestionar los errores de manera consistentemente.

Aunque aqui muestro una manera muy sencilla donde centralzar los errores, hoy  en día hay excelentes opciones que los proyectos profesionales suelen usar, por ejemplo usar Elastic Stack donde puedes almacenar los logs en Elasticsearch y visualizarlos con Kibana, otra muy buena opción el la dupla de Grafana y Prometheus.

Te invito a darle un vistazo a este [excelente documento de mejores parcticas](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices)

## Pasos para implementar

1. Instalamos la libreria [winston](https://www.npmjs.com/package/winston)

```bash
npm i winston
```

2. Creamos el archivo **_middleware/error-handler.js_** este será un middleware general que se encargará de manejar los errores.

```javascript
// Middleware que usaremos en nuestra aplicación para procesar los errores
module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
};
```

3. Creamos una carpeta llamada **_utils_** dentro de src.
4. Y dentro de esa carpeta creamos otra llamada **_logging_**
5. Craemos el archivo **_app-error.js_** dentro de **_logging_**. Esta es una clase que representara el error para toda la aplicación pero fijate que hereda de la clase base Error (...extends Error).

```javascript
/**
 * Implementación de nuestra propia clase de error
 */
module.exports = class AppError extends Error {
  constructor(
    message,
    httpStatus = 500,
    name = 'UnknownError',
    isOperational = false,
    innerException = null,
  ) {
    super(message);
    Error.captureStackTrace(this, AppError);
    this.message = message;
    this.name = name;
    this.status = httpStatus;
    this.date = new Date();
    this.isOperational = isOperational;
    this.innerException = innerException;
    this.expose = isOperational;
  }
};
```

6. Creamos ahora el archivo **_common-errors.js_** dentro de la carpeta **_logging_**. Aqui lo que estamos haciendo es tener un lugar donde mapear un nombre o descripcion para los statusCode http más comunes.

```javascript
module.exports = {
  InvalidInput: {
    name: 'InvalidInput',
    httpStatus: 422,
  },
  Unauthorized: {
    name: 'Unauthorized',
    httpStatus: 401,
  },
  NotFound: {
    name: 'NotFound',
    httpStatus: 404,
  },
  OperationNotAllowed: {
    name: 'OperationNotAllowed',
    httpStatus: 405,
  },
  DuplicateItem: {
    name: 'DuplicateItem',
    httpStatus: 409,
  },
  Conflict: {
    name: 'Conflict',
    httpStatus: 409,
  },
  BadFormat: {
    name: 'BadFormat',
    httpStatus: 400,
  },
  UnknownError: {
    name: 'UnknownError',
    httpStatus: 500,
  },
};
```

7. Creemos el archivo **_error-factory.js_** dentro de la carpeta **_logging_** el cual nos permitirá crear errores de manera consistente. Porque lo llamamos factory?, pues porque nos permite crear una instancia de la clase AppError que creamos asignandole el nombre y statusCode que tenemos en common-error.js.

```javascript
const AppError = require('./app-error');
const commonErrors = require('./common-errors');

module.exports = {
  InvalidInputError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.InvalidInput.httpStatus,
      commonErrors.InvalidInput.name,
      true,
      innerException,
    ),
  UnauthorizedError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.Unauthorized.httpStatus,
      commonErrors.Unauthorized.name,
      true,
      innerException,
    ),
  OperationNotAllowedError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.OperationNotAllowed.httpStatus,
      commonErrors.OperationNotAllowed.name,
      true,
      innerException,
    ),
  NotFoundError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.NotFound.httpStatus,
      commonErrors.NotFound.name,
      true,
      innerException,
    ),
  DuplicateItemError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.DuplicateItem.httpStatus,
      commonErrors.DuplicateItem.name,
      true,
      innerException,
    ),
  ConflictError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.Conflict.httpStatus,
      commonErrors.Conflict.name,
      true,
      innerException,
    ),
  BadFormatError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.BadFormat.httpStatus,
      commonErrors.BadFormat.name,
      true,
      innerException,
    ),
  UnknownError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.UnknownError.httpStatus,
      commonErrors.UnknownError.name,
      false,
      innerException,
    ),
};
```

8. Atención!! ahora vamos a modificar el codigo de **_middleware/schema-validator.js_** que creamos en el episodio anterior con el fin de que cuando los valores del request no pasen las validaciones de los esquemas (creados en el episodio anterior) arrojen un error del tipo AppError pero invocando al factory del paso anterior, ves ahora porque creamos todo esto?

```javascript
const { UnknownError, InvalidInputError } = require('../utils/logging/error-factory');

/**
 *
 * @param {object} contextPart propiedad del objeto context: ctx.headers | ctx.params | ctx.query | ctx.request.body
 * @param {string} label una descripción usada para el mensaje en caso de error
 * @param {object} schema el schema json (joi) que contiene las reglas de validacion, contiene un metodo validate
 * @param {object} options objeto opcional que pudiera enviarse al metodo shcema.validate
 */
const validateRequest = (contextPart, label, schema, options) => {
  if (schema) {
    const { error } = schema.validate(contextPart, options);
    if (error) {
      // codigo agregado en este paso: Manejamos los errores operacionales usando nuestra fabrica de errores
      throw UnknownError(`Invalid ${label} - ${error.message}`);
    }
  }
};

// ¿te confunde el doble arrow function, para que entiendas mejor es equivalente al siguiente ejemplo:
// const add = function (schema) {
//   return function (ctx, next) {
//     return ....bloque de codigo aqui
//   }
// }
// en resumen una funcion quedevuelve otra funcion
const validateSchema = (schema) => (ctx, next) => {
  try {
    // aplicar validaciones de cada una de las posibles partes del contexto del request
    validateRequest(ctx.headers, 'Headers', schema.headers, { allowUnknown: true });
    validateRequest(ctx.params, 'URL Parameters', schema.params);
    validateRequest(ctx.query, 'URL Query', schema.query);
    if (ctx.request.body) {
      validateRequest(ctx.request.body, 'Request Body', schema.body);
    }
    // invocar a la funcion sigueinte de la cadena (esto es importante en el cocepto de un middleware, porque son funciones previas que se ejecutan antes de llamar al metodo del controlador)
    return next();
  } catch (error) {
    // codigo agregado en este paso: Manejamos los errores operacionales usando nuestra fabrica de errores
    throw InvalidInputError(`Solicitud no válida: ${error.message}`);
  }
};

module.exports = validateSchema;
```

9. Modifquemos el controlador **_contacts.controller.js_** ahora ya no validamos si los parametros son inválidos, porque el schema-validator que usamos en contacts.route lo hace por nosotros.

```javascript
const contactModel = require('../models/contact.model');
const { NotFoundError } = require('../utils/logging/error-factory');

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
 * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
 */
module.exports.getByIndex = async (ctx) => {
  const index =
    ctx.params.index && !Number.isNaN(ctx.params.index) ? parseInt(ctx.params.index, 10) : 0;

  const filter = { index };
  const data = await contactModel.findOne(filter);
  if (data) {
    ctx.body = data;
  } else {
    // codigo agregado en este paso: Manejamos los errores operacionales usando nuestra fabrica de errores
    throw NotFoundError(`No se ha encontrado la persona con el indice ${index}`);
  }
};

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros
 * de la solicitud, en este caso desde el body,
 * obtendremos las propiedades de la persona a guardar a traves de ctx.request.body
 */
module.exports.save = async (ctx) => {
  const contact = ctx.request.body;
  const filter = { index: contact.index };
  const options = { upsert: true };
  await contactModel.updateOne(filter, contact, options);
  ctx.body = contact;
};
```

10. Tambien vamos a modificar el archivo **_middleware/auth.js_** y reemplazar \*_ctx.throw(401, 'Invalid Token')_ por el uso del ErrorFactory:

```javascript
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
// linea agregada en este paso: para importar el error factory para el error 401
const { UnauthorizedError } = require('../utils/logging/error-factory');

const env = yenv();

module.exports.verifyToken = (ctx, next) => {
  const token = ctx.request.headers['x-access-token'];

  if (!token) {
    ctx.throw(403, 'A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, env.TOKEN_KEY);
    ctx.request.user = decoded;
  } catch (err) {
    // linea agregada en este paso: sustituir *ctx.throw(401, 'Invalid Token')
    throw UnauthorizedError('Invalid Token');
  }
  return next();
};
```

11. Creamos un nuevo archivo llamado **_log-manager.js_** dentro de la carpeta **_logging_**. Este solo es un wrapper de winston, ya que nos facilita que si cambiamos por otra libreria no impacte las otras partes de nuestro código.

```javascript
const winston = require('winston');
const yenv = require('yenv');

const env = yenv();

module.exports = class LogManager {
  constructor() {
    const transports = [];
    if (env.LOGGER.TARGETS.FILE.ENABLED) {
      transports.push(
        new winston.transports.File({
          level: env.LOGGER.TARGETS.FILE.LEVEL,
          filename: env.LOGGER.TARGETS.FILE.PATH,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports,
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
  }

  info(info) {
    this.logger.info(info);
  }

  error(appError) {
    const isOperational = appError.isOperational || false;
    this.logger.error(appError);
    return isOperational;
  }
};
```

12. Agreguemos la configuración del logger winston en el archivo de configuración env.yaml, agregalo debajo de MONGODB_URL

```yaml
LOGGER:
  TARGETS:
    FILE:
      ENABLED: true
      LEVEL: 'info'
      PATH: 'error.log'
```

13. Ahora debemos modificar el **_server.js_**, las lineas nuevas y modificadas tienen el comentario **_linea agregada en este paso:_**

```javascript
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
// Inicializar los middleware
// linea agregada en este paso: agregar .use(apiError) para usar el middleware de manejo de errores en todas las solicitudes
app.use(bodyParser()).use(json()).use(logger()).use(errorHandler);

// eslint-disable-next-line array-callback-return
routes.map((item) => {
  app.use(item.routes()).use(item.allowedMethods());
});

// linea agregada en este paso: centralizar el manejo de errores con este evento
app.on('error', (err, ctx) => {
  console.error('logging error');
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
      console.log(`Escuchando en el puerto ${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
```

14. Hora de probar, iniciamos la aplicación y hagamos una solicitud cualquiera de los endpoints de contactos con un token incorrecto o vencido, o eliminalo del header del request. Aparte de tener un mejor manejo de los errores, si te das cuenta en la raiz del proyecto vas a encontrar un archivo ***error.log*** en el cual se logean los errores gracias a winston y todo el codigo que agregamos en este episodio. Como te dije anteriormente, en un proyecto profesional podrias tener este archivo y tener un proceso aparte que sincronice estos errores a un elasticsearch, cloudwatch o new relic. Incluso winston tiene otras librerias que se conectan con plataformas como elasticsearch.
