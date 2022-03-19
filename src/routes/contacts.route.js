const KoaRouter = require("koa-router");

const router = new KoaRouter({ prefix: "/contacts" });
const {
  getContactByIndex,
  updateContact,
  createContact,
} = require("../controllers/contacts.controller");

const { verifyToken } = require('../middleware/auth');
// codigo agregado en este paso. Importamos la funcion que hará de middleware para validar los esquemas
const validateSchema = require('../middleware/schema-validator');
// codigo agregado en este paso. Importamos los 2 esquemas que hemos creados para los 2 endpoints de contacts
const { byIndexSchema, postSchema } = require('../schemas/contacts.schema');
// codigo agregado en este paso: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (params) y el esquema apropiado. Recuerda que depende de la necesidad eso que aqui llamamos la parte de con contexto es en realidad donde vienen los datos en el request, por ejemplo: params, query (query string), body, header.
const byIndexValidator = validateSchema({ params: byIndexSchema });
// codigo agregado en este paso: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (body) y el esquema apropiado
const postValidator = validateSchema({ body: postSchema });

// GET /contacts/29
router.get("/byIndex", "/:index", verifyToken, byIndexValidator, getContactByIndex);
// POST /contacts/
router.post("/post", "/", verifyToken, postValidator, createContact);
// PUT /contacts/29
router.put("/put", "/:index", verifyToken, byIndexValidator, postValidator, updateContact);

module.exports = router;