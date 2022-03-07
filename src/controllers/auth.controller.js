const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
const userModel = require('../models/user.model');

const env = yenv();

module.exports.signUp = async (ctx) => {
  const { username, password } = ctx.request.body;
  const found = await userModel.findOne({ username });
  if(found) {
    ctx.throw(422, `Usuario ${username} ya existe`);
  } else {
    const salt = await bcrypt.genSalt();
    const hashedPassword =  await bcrypt.hash(password, salt);
    const newUser = { username, password: hashedPassword };
    await userModel.create(newUser);
    ctx.response.status = 201;
  }
};

module.exports.signIn = async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = await userModel.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      // eslint-disable-next-line no-underscore-dangle
      { user_id: user._id, username: user.username },
      env.TOKEN_KEY,
      { expiresIn: '2h' }
    );

    const expirationDate = new Date();
    expirationDate.setHours( expirationDate.getHours() + 2 );
    ctx.body = { access_token: token, token_expires: expirationDate };
  } else {
    ctx.throw(422, 'Usuario o password incorectos');
  }
};