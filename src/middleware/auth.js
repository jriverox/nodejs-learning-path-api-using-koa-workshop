const jwt = require('jsonwebtoken');
const yenv = require('yenv');

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
    ctx.throw(401, 'Invalid Token');
  }
  return next();
};

