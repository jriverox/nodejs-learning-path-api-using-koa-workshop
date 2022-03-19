/**
 * Expone una coleccion de todos los routes de nuestra api,
 * a pesar de que aqui solo se se expone personRoute en la vida real debería exponer todos .
 */
 const personRoute = require("./routes/contacts.route");
 // aqui podria exponer todos los routes, ejemplo module.exports = [personRoute, route2]
 module.exports = [personRoute];