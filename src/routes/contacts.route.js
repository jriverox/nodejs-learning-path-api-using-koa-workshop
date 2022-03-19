const KoaRouter = require("koa-router");

const router = new KoaRouter({ prefix: "/contacts" });
const {
  getContactByIndex,
  updateContact,
  createContact,
} = require("../controllers/contacts.controller");

// codigo agregado en este paso. Importamos la funcion que hará de middleware
const { verifyToken } = require('../middleware/auth');

// codigo agregado en este paso: colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// GET /contacts/29
router.get("/byIndex", "/:index", verifyToken, getContactByIndex);

// codigo agregado en este paso: colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// POST /contacts/
router.post("/post", "/", verifyToken, createContact);

// codigo agregado en este paso: colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// PUT /contacts/29
router.put("/put", "/:index", verifyToken, updateContact);

module.exports = router;