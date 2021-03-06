# Episodio 4: Manejo de Errores <!-- omit in toc -->

## Tabla de Contenido <!-- omit in toc -->

- [Introducción](#introducción)
- [Implementación](#implementación)
- [Notas adicionales](#notas-adicionales)

## Introducción

Para logear los errores usaremos la librería [winston](https://www.npmjs.com/package/winston), aunque podríamos usar cualquier otra librería esto de hecho no es lo más relevante, ya que lo importante es manejar de manera centralizada los errores e incluso disponer de nuestra lógica de negocio para gestionar los errores de manera consistentemente.

Aunque aquí muestro una manera muy sencilla donde centralizar los errores, hoy en día hay excelentes opciones que los proyectos profesionales suelen usar, por ejemplo, usar Elastic Stack donde puedes almacenar los logs en Elasticsearch y visualizarlos con Kibana, otra muy buena opción la dupla de Grafana y Prometheus.

Te invito a darle un vistazo a este [excelente documento de mejores parcticas](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices)

## Implementación

1. Instalamos la librería [winston](https://www.npmjs.com/package/winston)

```bash
npm i winston
```

2. Creamos el archivo `error-handler.js`dentro de la carpeta `middleware` este será un middleware general que se encargará de manejar los errores.

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

3. Creamos una carpeta llamada `utils` dentro de `src`.

4. Y dentro de esa carpeta creamos otra llamada `logging`.

5. Creamos el archivo `app-error.js` dentro de `logging`. Esta es una clase que representara el error para toda la aplicación, pero fíjate que hereda de la clase base Error (...extends Error).

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

6. Creamos ahora el archivo `common-errors.js` dentro de la carpeta `logging`. Aquí lo que estamos haciendo es tener un lugar donde mapear un nombre o descripción para los statusCode http más comunes.

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

7. Creemos el archivo `error-factory.js` dentro de la carpeta `logging` el cual nos permitirá crear errores de manera consistente. Porque lo llamamos factory?, pues porque nos permite crear una instancia de la clase AppError que creamos asignándole el nombre y statusCode que tenemos en common-error.js.

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

8. Atención!! ahora vamos a modificar el código de `middleware/schema-validator.js` que creamos en el episodio anterior con el fin de que cuando los valores del request no pasen las validaciones de los esquemas (creados en el episodio anterior) arrojen un error del tipo AppError pero invocando al factory del paso anterior, ves ahora porque creamos todo esto?

```javascript
// codigo agregado en este paso:
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

9. Modifiquemos el controlador `contacts.controller.js` ahora ya no validamos si los parámetros son inválidos, porque el schema-validator que usamos en contacts.route lo hace por nosotros. Asimismo para que use el error factory en lugar de ctx.throw.

```javascript
const contactModel = require("../models/contact.model");
// codigo agregado en este paso:
const { NotFoundError } = require('../utils/logging/error-factory');

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
 * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
 */
module.exports.getContactByIndex = async (ctx) => {
  const { index } = ctx.params;

  const filter = { index: parseInt(index, 10) };
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
 * obtendremos las propiedades de la contacto a guardar a traves de ctx.request.body
 */
module.exports.updateContact = async (ctx) => {
  const { index } = ctx.params;
  const contact = ctx.request.body;
  const filter = { index: parseInt(index, 10) };
  const options = { upsert: false };
  const found = await contactModel.findOne(filter);

  if (!found) {
    // codigo agregado en este paso:
    throw NotFoundError(`No se ha encontrado la persona con el indice ${index}`);
  } else {
    await contactModel.updateOne(filter, contact, options);
    ctx.body = contact;
  }
};

module.exports.createContact = async (ctx) => {
  const { index } = await contactModel.findOne({}, "index", {
    sort: { index: -1 },
  });
  const contact = { ...ctx.request.body, index: index + 1 };
  await contactModel.create(contact);
  ctx.body = contact;
  ctx.response.status = 201;
};
```

10.  También necesitamos modificar el controlador `auth.controller.js` para que use el `error-factory` en lugar de `ctx.throw`.

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
const userModel = require('../models/user.model');
// codigo agregado en este paso:
const { InvalidInputError, UnauthorizedError } = require('../utils/logging/error-factory');

const env = yenv();

module.exports.signUp = async (ctx) => {
  const { username, password } = ctx.request.body;
  // validar que el usuario exista
  const found = await userModel.findOne({ username });

  if (found) {
    // codigo agregado en este paso:
    throw InvalidInputError(`Usuario ${username} ya existe`);
  } else {
    // crear un hash del password para no almacenarlo en texto plano en la bd
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = { username, password: hashedPassword };
    // guardar el usuario en la bd
    await userModel.create(newUser);
    // devolver 201 para indicar que sea a creado el recurso (usuario)
    ctx.response.status = 201;
  }
};

module.exports.signIn = async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = await userModel.findOne({ username });
  const tokenExpirationHours = env.TOKEN_EXPIRATION_HOURS
    ? parseInt(env.TOKEN_EXPIRATION_HOURS, 10)
    : 24;
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      // eslint-disable-next-line no-underscore-dangle
      { user_id: user._id, username: user.username },
      env.TOKEN_KEY,
      { expiresIn: `${tokenExpirationHours}h` },
    );

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + tokenExpirationHours);
    ctx.body = { access_token: token, token_expires: expirationDate };
  } else {
    // codigo agregado en este paso:
    throw UnauthorizedError('Usuario o password incorectos');
  }
};
```
11.  También vamos a modificar el archivo `middleware/auth.js` y reemplazar `_ctx.throw(401, 'Invalid Token')`_ por el uso del error-factory:

```javascript
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
const { UnauthorizedError } = require('../utils/logging/error-factory');

const env = yenv();

module.exports.verifyToken = (ctx, next) => {
  const token = ctx.request.headers['x-access-token'];

  if (!token) {
    throw UnauthorizedError('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, env.TOKEN_KEY);
    ctx.request.user = decoded;
  } catch (err) {
    throw UnauthorizedError('Invalid Token');
  }
  return next();
};
```

12. Creamos un nuevo archivo llamado `log-manager.js` dentro de la carpeta `logging`. Este solo es un wrapper de winston, ya que nos facilita que si cambiamos por otra librería no impacte las otras partes de nuestro código.

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

13. Agreguemos la configuración del logger winston en el archivo de configuración env.yaml, agrégalo debajo de MONGODB_URL

```yaml
LOGGER:
  TARGETS:
    FILE:
      ENABLED: true
      LEVEL: 'info'
      PATH: 'error.log'
```

14. Ahora debemos modificar el `server.js`, las líneas nuevas y modificadas tienen el comentario *linea agregada en este paso:*

```javascript
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
      console.log(`Escuchando en el puerto ${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });

```

15. Hora de probar, iniciamos la aplicación y hagamos una solicitud cualquiera de los endpoints de contactos con un token incorrecto o vencido, o elimínalo del header del request.

## Notas adicionales

Aparte de tener un mejor manejo de los errores, si te das cuenta en la raíz del proyecto vas a encontrar un archivo `error.log` en el cual se logean los errores gracias a winston y todo el código que agregamos en este episodio. Como te dije anteriormente, en un proyecto profesional podrías tener este archivo y tener un proceso aparte que sincronice estos errores a un elasticsearch, cloudwatch o new relic. Incluso winston tiene otras librerías que se conectan con plataformas como elasticsearch.
