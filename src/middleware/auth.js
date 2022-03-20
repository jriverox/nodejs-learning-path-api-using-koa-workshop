const jwt = require('jsonwebtoken');
const yenv = require('yenv');
// codigo agregado en este paso
const { UnauthorizedError } = require('../utils/logging/error-factory');

const env = yenv();

module.exports.verifyToken = (ctx, next) => {
  // esperamos que el token venga en el header del request y que tenga la key x-access-token
  const token = ctx.request.headers['x-access-token'];
  // si es nulo devolvemos un error 403
  if (!token) {
    // codigo agregado en este paso
    throw UnauthorizedError('A token is required for authentication');
  }
  try {
    // decodificamos el token usando la libreria
    const decoded = jwt.verify(token, env.TOKEN_KEY);
    ctx.request.user = decoded;
  } catch (err) {
    // codigo agregado en este paso
    throw UnauthorizedError('Invalid Token');
  }
  return next();
};