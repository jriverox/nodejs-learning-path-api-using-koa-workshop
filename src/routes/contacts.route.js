const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getContactByIndex, updateContact, createContact } = require('../controllers/contacts.controller');
const { verifyToken } = require('../middleware/auth');


const validateSchema = require('../middleware/schema-validator');

const { byIndexSchema, postSchema } = require('../schemas/contacts.schema');
// codigo agregado en este paso: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (params) y el esquema apropiado
const byIndexValidator = validateSchema({ params: byIndexSchema });
// codigo agregado en este paso: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (body) y el esquema apropiado
const postValidator = validateSchema({ body: postSchema });

// colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// GET /contacts/29
router.get('/byIndex', '/:index', verifyToken, byIndexValidator,  getContactByIndex);

// codigo agregado en este paso: agregar postValidator despues antes de llamar a la funcion del controller.
// colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// POST
router.post('/post', '/', verifyToken, postValidator, createContact);

// PUT /contacts/29
router.put('/put', '/:index', verifyToken, byIndexValidator, postValidator, updateContact);

module.exports = router;
