# Episodio 3: Implementando validaciones a los requests

La idea de este episodio es implementar un mecanismo de validación para los endpoints ***GET /contacts/:index*** que llama a contacts.controller.getByIndex para obtener un contacto por el Id y para el ***POST /contacts*** que invoca al contacts.controller.save para crear y/o a actualizar un contacto.

Tal vez laprimera idea que pudieras pensar es implementar las validaciones con if, pero aqui es donde joi nos aporta algo ineteresante ya que ofrece un mecanismo para definir "esquemas json" y poder validar los datos que vienen en los requests http (GET, POST, DELETE, etc).

## Pasos para implementar

1. Instalamos la libreria [joi](https://www.npmjs.com/package/joi)

```bash
npm i joi
```

2. Creamos el archivo ****schema-validator.js**** dentro de la carpeta ***middleware***.

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

:eight_spoked_asterisk: Nota: Recuerda que un middleware es en resumen una funcion que se ejecutará antes de la función final. En el episodio 2 creamos uno llamado auth.js con el fin de validar el token. En este paso estamos creando unp que servirá para validar si los datos enviados en el request coinciden con el formato esperado.

3. Ahora creamos la carpeta ***schemas*** dentro de src

4. Creamos el archivo ***middleware/contacts.schema.js*** para definir las reglas de validacion de los escenarios.

```javascript
const Joi = require('joi');

const byIndexSchema = Joi.object().keys({
  index: Joi.number().min(1).required(),
});

const postSchema = Joi.object().keys({
  index: Joi.number().min(1).required(),
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

5. Ahora modificamos el archivo ***routes/contacts.route.js*** para indicarle a la aplicación que use el esquema ***contacts.schema.js*** y middleware ***schema-validator.js*** creados anteriormente. Fijate en los comentarios que empiezan con ***codigo agregado en este paso:*** o con ***codigo modificado en este paso:*** , el archivo final debe quedar asi:

```javascript
const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getByIndex, save } = require('../controllers/contacts.controller');
// codigo agregado en este paso. Importamos la funcion que hará de middleware
const { verifyToken } = require('../middleware/auth');

const validateSchema = require('../middleware/schema-validator');

const { byIndexSchema, postSchema } = require('../schemas/contacts.schema');
// codigo agregado en este paso: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (params) y el esquema apropiado
const byIndexValidator = validateSchema({ params: byIndexSchema });
// codigo agregado en este paso: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (body) y el esquema apropiado
const postValidator = validateSchema({ body: postSchema });
// codigo agregado en este paso: agregar byIndexValidator despues antes de llamar a la funcion del controller.
// colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// GET /contacts/29
router.get('/byIndex', '/:index', verifyToken, byIndexValidator, getByIndex);

// codigo agregado en este paso: agregar postValidator despues antes de llamar a la funcion del controller.
// colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// POST
router.post('/post', '/', verifyToken, postValidator, save);

module.exports = router;
```

6. Listo tiempo de probar, inicia la aplicación y obten un token de algun usuario que hayas creado, luego realiza por Postman haz un request al ***GET localhost:3000/contacts/1*** esperando se ejecute bien y ahora cambia el parametro 1 por un letra y veras que recibes un StatusCode 422 con el mensaje *Invalid URL Parameters - "index" must be a number*.

7. Realiza tambien varias pruebas en el POST quitando por ejemplo un campo que hayamos establecido como requerido en el schema (postSchema). Tambien prueba enviando un tipo de datos incorrecto por ejemplo un email invalido en el campo email.
