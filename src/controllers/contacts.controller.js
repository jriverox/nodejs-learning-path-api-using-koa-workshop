const contactModel = require('../models/contact.model');

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
 * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
 */
module.exports.getContactByIndex = async (ctx) => {
  const { index } = ctx.params;

  if (index > 0) {
    const filter = { index };
    const data = await contactModel.findOne(filter);
    if (data) {
      ctx.body = data;
    } else {
      ctx.throw(404, `No se ha encontrado la contacto con el indice ${index}`);
    }
  } else {
    ctx.throw(422, `Valor ${ctx.params.index} no soportado`);
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
  const filter = { index };
  const options = { upsert: false };
  const found = await contactModel.exists(filter);

  if (!found) {
    ctx.throw(404, `No se ha encontrado la contacto con el indice ${index}`);
  } else {
    await contactModel.updateOne(filter, contact, options);
    ctx.body = contact;
  }
};

module.exports.createContact = async (ctx) => {
  const contact = ctx.request.body;
  const {index} = await contactModel.findOne().limit(1).sort('-index').select('index').exec();
  contact.index = index + 1;
  await contactModel.create(contact);
  ctx.body = contact;
  ctx.response.status = 201;
};