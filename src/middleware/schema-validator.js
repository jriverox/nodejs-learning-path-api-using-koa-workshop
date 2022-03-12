const { UnknownError, InvalidInputError } = require('../utils/logging/error-factory');

/* eslint-disable consistent-return */
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
      throw UnknownError(`Invalid ${label} - ${error.message}`)
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
    throw InvalidInputError(`Solicitud no válida: ${error.message}`)
  }
}

module.exports = validateSchema;