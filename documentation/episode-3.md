# Episodio 3: Validando los Requests <!-- omit in toc -->

## Contenido <!-- omit in toc -->

- [Introducción](#introducción)
- [Implementación](#implementación)
- [Notas adicionales](#notas-adicionales)

## Introducción

La idea de este episodio es implementar un mecanismo de validación para los endpoints:

- `GET /contacts/:index` que llama a `contacts.controller.getByIndex` para obtener un contacto por el campo index.
- `POST /contacts/` que invoca al `contacts.controller.createContact` para crear un contacto.
- `PUT /contacts/:index` que invoca al `contacts.controller.updateContact` para actualizar un contacto.

Tal vez lo primero que pudieras pensar es implementar las validaciones con `if`, pero aquí es donde `joi` nos aporta algo interesante ya que ofrece un mecanismo para definir "esquemas json" y poder validar los datos que vienen en los requests http (GET, POST, DELETE, etc).

## Implementación

1. Instalamos la librería [joi](https://www.npmjs.com/package/joi)

```bash
npm i joi
```

2. Creamos el archivo `schema-validator.js` dentro de la carpeta `middleware`. Este contiene la lógica para valdiar los datos que vengan en la solicitud http, aplicando las reglas que se definan en el esquema json al que está asociado.

```javascript
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
      throw new Error(`Invalid ${label} - ${error.message}`);
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
    ctx.throw(422, error.message);
  }
};

module.exports = validateSchema;
```

:eight_spoked_asterisk: Nota: Recuerda que un middleware es en resumen una función que se ejecutará antes de la función del controller. En el episodio 2 creamos uno llamado auth.js con el fin de validar el token. En este paso estamos creando uno que servirá para validar si los datos enviados en el request coinciden con el formato esperado. Por ejemplo queremos que en el Post al intentar guardar un contacto tenga los campos mínimos requeridos y que los campos tengas el tipo de datos y formatos y longitudes mínimas definidas por nosotros.

3. Ahora creamos la carpeta `schemas` dentro de `src`

4. Creamos el archivo `contacts.schema.js` dentro de la carpeta `schemas` para definir las reglas de validación de los escenarios.

```javascript
const Joi = require('joi');

const byIndexSchema = Joi.object().keys({
  index: Joi.number().min(1).required(),
});

const postSchema = Joi.object().keys({
  dateOfBirth: Joi.date().iso().required(),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  username: Joi.string().min(3).required(),
  company: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().min(5).required(),
    city: Joi.string().min(5).required(),
    state: Joi.string().min(5).required(),
  }),
  jobPosition: Joi.string().optional(),
  roles: Joi.array().items(Joi.string()).optional(),
  active: Joi.bool().default(true).optional(),
});

module.exports = {
  byIndexSchema,
  postSchema,
};
```

5. Ahora modificamos el archivo `routes/contacts.route.js` para indicarle a la aplicación que use el esquema `contacts.schema.js` y el middleware `schema-validator.js` creados anteriormente. Fíjate en los comentarios que empiezan con *codigo agregado en este paso:* o con *codigo modificado en este paso:* , el archivo final debe quedar así:

```javascript
const KoaRouter = require("koa-router");

const router = new KoaRouter({ prefix: "/contacts" });
const {
  getContactByIndex,
  updateContact,
  createContact,
} = require("../controllers/contacts.controller");

const { verifyToken } = require('../middleware/auth');
// codigo agregado en este paso
const validateSchema = require('../middleware/schema-validator');
// codigo agregado en este paso
const { byIndexSchema, postSchema } = require('../schemas/contacts.schema');
// codigo agregado en este paso
const byIndexValidator = validateSchema({ params: byIndexSchema });
// codigo agregado en este paso
const postValidator = validateSchema({ body: postSchema });

// GET /contacts/29
router.get("/byIndex", "/:index", verifyToken, byIndexValidator, getContactByIndex);
// POST /contacts/
router.post("/post", "/", verifyToken, postValidator, createContact);
// PUT /contacts/29
router.put("/put", "/:index", verifyToken, byIndexValidator, postValidator, updateContact);

module.exports = router;
```

6. Listo tiempo de probar, inicia la aplicación y obtén un token de algún usuario que hayas creado, luego realiza por Postman haz un request al `GET localhost:3000/contacts/1` esperando se ejecute bien y ahora cambia el parametro 1 por un letra y veras que recibes un StatusCode 422 con el mensaje *Invalid URL Parameters - "index" must be a number*.

7. Realiza también varias pruebas en el POST quitando por ejemplo un campo que hayamos establecido como requerido en el schema (postSchema). También prueba enviando un tipo de datos incorrecto por ejemplo un email invalido en el campo email.

## Notas adicionales

Fíjate que en paso 5, en cada uno de los routes definidos por ejemplo:  *router.put("/put", "/:index", verifyToken, byIndexValidator, postValidator, updateContact);* antes de ejecutar el método `updateContact`el cual es del controlador, se invocan los middleware `verifyToken`, `byIndexValidator` y `postValidator`.  byIndexValidator y postValidator se llaman para validar tanto los parámetros del path (ejemplo: contacts/1) y el body, por esta razón en este caso se invocan las dos valdiaciones de 2 difererentes esquemas, en el caso de los otros routes solo se ejecuta una sola validación de un esquema.
