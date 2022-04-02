const serverless = require('serverless-http');
const mongoose = require('mongoose');
const yenv = require('yenv');
const app = require('./app');
const { connect } = require('./utils/db-connection');

const env = yenv();
let connection = null;
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (connection == null) {
    connection = await connect();
  }
  
  return handler(event, context);
}



