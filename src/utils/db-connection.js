const mongoose = require('mongoose');
const yenv = require('yenv');

const env = yenv();
let conn = null;
const uri = env.MONGODB_URL;

module.exports.connect = async () => {
  if (conn == null) {
    conn = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    }).then(() => mongoose);
    
    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn;
  }

  return conn;
};