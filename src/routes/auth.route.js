const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/auth' });
const { signUp, signIn } = require('../controllers/auth.controller');

router.post('auth/signup', '/signup', signUp);

router.post('auth/signin', '/signin', signIn);

module.exports = router;