const contactModel = require("../models/contact.model");
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
