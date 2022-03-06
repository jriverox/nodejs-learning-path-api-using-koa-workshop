const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getByIndex, save } = require('../controllers/contacts.controller');

// GET /contacts/29
router.get('/byIndex', '/:index', getByIndex);

// POST
router.post('/post', '/', save);

module.exports = router;
