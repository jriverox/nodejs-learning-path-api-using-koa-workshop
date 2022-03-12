const contactModel = require('../models/contact.model');
const { NotFoundError } = require('../utils/logging/error-factory');

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
 * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
 */
module.exports.getByIndex = async (ctx) => {
  const index = ctx.params.index && !Number.isNaN(ctx.params.index) ? parseInt(ctx.params.index, 10) : 0;

  const filter = { index };
  const data = await contactModel.findOne(filter);
  if (data) {
    ctx.body = data;
  } else {
    // codigo agregado en este paso: Manejamos los errores operacionales usando nuestra fabrica de errores
    throw NotFoundError(`No se ha encontrado la persona con el indice ${index}`)
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
