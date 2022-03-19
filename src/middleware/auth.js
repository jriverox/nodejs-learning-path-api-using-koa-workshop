const jwt = require('jsonwebtoken');
const yenv = require('yenv');

const env = yenv();

module.exports.verifyToken = (ctx, next) => {
  // esperamos que el token venga en el header del request y que tenga la key x-access-token
  const token = ctx.request.headers['x-access-token'];
  // si es nulo devolvemos un error 403
  if (!token) {
    ctx.throw(403, 'A token is required for authentication');
  }
  try {
    // decodificamos el token usando la libreria
    const decoded = jwt.verify(token, env.TOKEN_KEY);
    ctx.request.user = decoded;
  } catch (err) {
    ctx.throw(401, 'Invalid Token');
  }
  return next();
};