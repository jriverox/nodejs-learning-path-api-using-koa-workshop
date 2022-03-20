const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
const userModel = require('../models/user.model');
// codigo agregado en este paso
const { InvalidInputError, UnauthorizedError } = require('../utils/logging/error-factory');

const env = yenv();

module.exports.signUp = async (ctx) => {
  const { username, password } = ctx.request.body;
  // validar que el usuario exista
  const found = await userModel.findOne({ username });
  if (found) {
    // codigo agregado en este paso
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
  // capturamos las credenciales del usario que esta tratando de autenticaser desde el body del request.
  const { username, password } = ctx.request.body;
  // buscamos el usuario con el username para validar si existe
  const user = await userModel.findOne({ username });
  const tokenExpirationHours = env.TOKEN_EXPIRATION_HOURS ? parseInt(env.TOKEN_EXPIRATION_HOURS, 10) : 24;
  // usamos bcrypt.compare para validar si el hash del password introducido por el usuario coicide con el almacenado en la bd.
  if (user && (await bcrypt.compare(password, user.password))) {
    // si el usuario es valido generamos un token usando jwt.Recuerda tener la variable de entorno TOKEN_KEY en el archivo env.yaml
    const token = jwt.sign({ user_id: user._id, username: user.username }, env.TOKEN_KEY, {
      expiresIn: `${tokenExpirationHours}h`,
    });

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + tokenExpirationHours);
    // devolvemos el token que por las proximas 2h podra usar para autenticarse
    ctx.body = { access_token: token, token_expires: expirationDate };
  } else {
    // codigo agregado en este paso
    throw UnauthorizedError('Usuario o password incorectos');
  }
};