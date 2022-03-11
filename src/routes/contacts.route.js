const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getByIndex, save } = require('../controllers/contacts.controller');
// codigo agregado en estepaso. Importamos la funcion que hará de middleware
const { verifyToken } = require('../middleware/auth');

// colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// GET /contacts/29
router.get('/byIndex', '/:index', verifyToken, getByIndex);

// colocamos lafuncion verifyToken para que se ejecute en cadarequest antes de invocar a la funcion del controllador
// POST
router.post('/post', '/', verifyToken, save);

module.exports = router;
