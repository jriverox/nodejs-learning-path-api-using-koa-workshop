const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getContactByIndex, updateContact, createContact } = require('../controllers/contacts.controller');

// GET /contacts/29
router.get('/byIndex', '/:index', getContactByIndex);

// POST /contacts/
router.post('/post', '/', createContact);

// PUT /contacts/29
router.put('/put', '/:index', updateContact);

module.exports = router;
