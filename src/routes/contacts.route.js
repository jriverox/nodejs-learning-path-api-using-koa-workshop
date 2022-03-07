const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getByIndex, save } = require('../controllers/contacts.controller');
const { verifyToken } = require('../middleware/auth');
// GET /contacts/29
router.get('/byIndex', '/:index', verifyToken, getByIndex);

// POST
router.post('/post', '/', verifyToken, save);

module.exports = router;
