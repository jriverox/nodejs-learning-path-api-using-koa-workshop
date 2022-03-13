const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
const userModel = require('../models/user.model');
const { InvalidInputError, UnauthorizedError } = require('../utils/logging/error-factory');

const env = yenv();

module.exports.signUp = async (ctx) => {
  const { username, password } = ctx.request.body;
  // validar que el usuario exista
  const found = await userModel.findOne({ username });
  
  if(found) {
    throw InvalidInputError(`Usuario ${username} ya existe`);
  } else {
    // crear un hash del password para no almacenarlo en texto plano en la bd
    const salt = await bcrypt.genSalt();
    const hashedPassword =  await bcrypt.hash(password, salt);
    const newUser = { username, password: hashedPassword };
    // guardar el usuario en la bd
    await userModel.create(newUser);
    // devolver 201 para indicar que sea a creado el recurso (usuario)
    ctx.response.status = 201;
  }
};

module.exports.signIn = async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = await userModel.findOne({ username });
  const tokenExpirationHours = env.TOKEN_EXPIRATION_HOURS ? parseInt(env.TOKEN_EXPIRATION_HOURS, 10) : 24;
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      // eslint-disable-next-line no-underscore-dangle
      { user_id: user._id, username: user.username },
      env.TOKEN_KEY,
      { expiresIn: `${tokenExpirationHours}h` }
    );

    const expirationDate = new Date();
    expirationDate.setHours( expirationDate.getHours() + tokenExpirationHours );
    ctx.body = { access_token: token, token_expires: expirationDate };
  } else {
    throw UnauthorizedError('Usuario o password incorectos');
  }
};