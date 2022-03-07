const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');

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
    ctx.response.status = 204;
  } else {
    ctx.throw(422, 'Usuario o password incorectos');
  }
};