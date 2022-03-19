# Episodio 2: Protegiendo el acceso del API

En este episodio nos enfocaremos en proteger el acceso a los endpoints del API usando Jason Web Token también conocido como [JWT](https://jwt.io/introduction). Para ello usaremos las librerías [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) y [bcrypt](https://www.npmjs.com/package/bcrypt).

## Pasos para implementar

### Creacioón del Usuario (SignUp)

1. Instalamos las librerías que vamos a necesitar. [bcrypt](https://www.npmjs.com/package/bcrypt). Para crear un hash del password del usuario y no almacenarlo en texto plano. Y [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) y [bcrypt](https://www.npmjs.com/package/bcrypt) nos ayudara a generar un token cuando el usuario se autentique.

```bash
npm i bcrypt jsonwebtoken
```

2. Crea el archivo `user.model.js`dentro de la carpeta `models`. Este modelo nos permitirá persistir las credenciales de los usuarios (username y password).

```javascript
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'users',
  },
);

const userModel = model('UserModel', userSchema);
module.exports = userModel;
```

3. Creamos el archivo `auth.controller.js`dentro de la carpeta `controllers` con la función *signUp* para registrar nuevos usuarios.

```javascript
const bcrypt = require('bcrypt');
const yenv = require('yenv');
const userModel = require('../models/user.model');

const env = yenv();

module.exports.signUp = async (ctx) => {
  const { username, password } = ctx.request.body;
  // validar que el usuario exista
  const found = await userModel.findOne({ username });
  if (found) {
    ctx.throw(422, `Usuario ${username} ya existe`);
  } else {
    // crear un hash del password para no almacenarlo en texto plano en la bd
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = { username, password: hashedPassword };
    // guardar el usuario en la bd
    await userModel.create(newUser);
    // devolver 201 para indicar que sea a creado el recurso (usuario)
    ctx.response.status = 201;
  }
};
```

4. Creamos el archivo `auth.route.js`dentro de la carpeta `routes`. Donde expondremos el endpoint *auth/signUp*.

```javascript
const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/auth' });
const { signUp } = require('../controllers/auth.controller');

router.post('auth/signup', '/signup', signUp);

module.exports = router;
```

5. Edita el archivo `routes.js` y asegúrate de agregar el auth.route creado previamente, el archivo debe quedar así:

```javascript
const personRoute = require('./routes/contacts.route');
const authRoute = require('./routes/auth.route');

module.exports = [personRoute, authRoute];
```

6. Ahora necesitamos ejecutar la aplicación para poder crear al menos un usuario porque vamos a necesitar el usuario y el password más adelante.

```bash
npm start
```

7. Abre Postman y en una nueva pestaña selecciona como verbo `POST` y el url `localhost:3000/auth/signup` haz clic en `Body` y elige la opción `x-wwww-form-urlencoded` ahora agrega dos keys `username` y `password`. Estos datos recuérdalos para que los puedas usar mas adelante para autenticarte. Te dejo un ejemplo de código en curl para que tengas una idea:

```bash
curl --location --request POST 'localhost:3000/auth/signup' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=miusuario' \
--data-urlencode 'password=misecreto'
```

8. Si todo salió bien el usuario se debe haber creado. De hecho, la colección users se crea automáticamente, consulta los datos en Mongo, veras que el password se ha generado como un *hash*, tal como lo implementamos en `controllers/users.controller.js` función *signUp*.

### Autenticación y Manejo del Token

Hasta aquí hemos creado todo el código para crear un usuario. Ahora vamos a implementar el método de autenticación y la generación del Token.

1. Editamos el archivo `env.yaml` y agreguemos las variables: `TOKEN_KEY` este valor lo usaremos para generar y validar el token y `TOKEN_EXPIRATION_HOURS` que usaremos para tener la cantidad de horas de duración del token.

```yaml
development:
  PORT: 3000
  MONGODB_URL: 'mongodb://localhost:27017/contacts_demo'
  TOKEN_KEY: '1ldTgJBkSOA9xBrV'
  TOKEN_EXPIRATION_HOURS: 750
production:
  PORT: 3000
  MONGODB_URL: 'mmongodb+srv://tu-usuario:tu-contraseña@cluster0-8hxu4.mongodb.net/contacts?retryWrites=true&w=majority'
  TOKEN_KEY: '1ldTgJBkSOA9xBrV'
  TOKEN_EXPIRATION_HOURS: 24
```

2. Editemos el archivo `auth.controller.js` ubicado dentro de `controllers` e importemos el module npm jsonwebtoken y también agregaremos la función signIn para autenticar y generar el token. Coloco todo el código aquí para que estés seguro de como debe quedar, pero presta atención al lo que sea ha agregado. He colocado el comentario: `codigo agregado en este paso`

```javascript
const bcrypt = require('bcrypt');
// codigo agregado en este paso
const jwt = require('jsonwebtoken');
const yenv = require('yenv');
const userModel = require('../models/user.model');

const env = yenv();

module.exports.signUp = async (ctx) => {
  const { username, password } = ctx.request.body;
  // validar que el usuario exista
  const found = await userModel.findOne({ username });
  if (found) {
    ctx.throw(422, `Usuario ${username} ya existe`);
  } else {
    // crear un hash del password para no almacenarlo en texto plano en la bd
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = { username, password: hashedPassword };
    // guardar el usuario en la bd
    await userModel.create(newUser);
    // devolver 201 para indicar que sea a creado el recurso (usuario)
    ctx.response.status = 201;
  }
};
// codigo agregado en este paso
module.exports.signIn = async (ctx) => {
  // capturamos las credenciales del usario que esta tratando de autenticaser desde el body del request.
  const { username, password } = ctx.request.body;
  // buscamos el usuario con el username para validar si existe
  const user = await userModel.findOne({ username });
  const tokenExpirationHours = env.TOKEN_EXPIRATION_HOURS ? parseInt(env.TOKEN_EXPIRATION_HOURS, 10) : 24;
  // usamos bcrypt.compare para validar si el hash del password introducido por el usuario coicide con el almacenado en la bd.
  if (user && (await bcrypt.compare(password, user.password))) {
    // si el usuario es valido generamos un token usando jwt.Recuerda tener la variable de entorno TOKEN_KEY en el archivo env.yaml
    const token = jwt.sign({ user_id: user._id, username: user.username }, env.TOKEN_KEY, {
      expiresIn: `${tokenExpirationHours}h`,
    });

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + tokenExpirationHours);
    // devolvemos el token que por las proximas 2h podra usar para autenticarse
    ctx.body = { access_token: token, token_expires: expirationDate };
  } else {
    ctx.throw(422, 'Usuario o password incorectos');
  }
};
```

3. Editamos el archivo `auth.route.js` dentro del folder `routes` y agregaremos la función `signIn` en el require del auth.controller, también agregaremos el post invocará el signIn.

```javascript
const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/auth' });
// codigo modificado en este paso (se ha agregado signIn)
const { signUp, signIn } = require('../controllers/auth.controller');

router.post('auth/signup', '/signup', signUp);
// codigo agregado en este paso
router.post('auth/signin', '/signin', signIn);

module.exports = router;
```

4. Ahora necesitamos crear un `middleware` que nos permitirá implementar una validación del token para determinar si el usuario se ha autenticado antes de invocar a los endpoints del controller contacts. Para ello crea la carpeta `middleware` dentro de `src`.

5. Y ahora creamos el archivo `auth.js` dentro de esa carpeta:

```javascript
const jwt = require('jsonwebtoken');
const yenv = require('yenv');

const env = yenv();

module.exports.verifyToken = (ctx, next) => {
  // esperamos que el token venga en el header del request y que tenga la key x-access-token
  const token = ctx.request.headers['x-access-token'];
  // si es nulo devolvemos un error 403
  if (!token) {
    ctx.throw(403, 'A token is required for authentication');
  }
  try {
    // decodificamos el token usando la libreria
    const decoded = jwt.verify(token, env.TOKEN_KEY);
    ctx.request.user = decoded;
  } catch (err) {
    ctx.throw(401, 'Invalid Token');
  }
  return next();
};
```

6. Te preguntarás donde usaremos el middleware creado en el paso anterior. Edita el archivo `routes/contacts.route.js` e importa la referencia de `middleware/auth.js` y agrégalo a cada endpoint antes de invocar cada método del controller.

```javascript
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
```

7. Hemos terminado la implementación y es hora de probar. Envía un `POST` a `localhost:3000/auth/signin` y utiliza el mismo body que usaste cuando creaste al usuario. Nuevamente te muestro desde código curl para que tengas una idea mas clara. Recuerda usar las credenciales de algún usuario que hayas creado. La contraseña que debes poner es el texto plano, NO el hash guardado en la BD.

```bash
curl --location --request POST 'localhost:3000/auth/signin' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=miusuario' \
--data-urlencode 'password=misecreto'
```

8. Si todo salió recibirás un response similar a:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjIyNTUxMjEzOTI3ZTE3NTUzZDg1ZjdkIiwidXNlcm5hbWUiOiJqcml2ZXJveCIsImlhdCI6MTY0Njk2NjEzNiwiZXhwIjoxNjQ2OTczMzM2fQ.Xu3P6Q5QetOLYy6a_BuwkrByDh99iS0Q0_9wjyUVfpk",
  "token_expires": "2022-03-11T04:35:36.241Z"
}
```

9. Prueba haciendo un `GET` al endpoint `localhost:3000/contacts/1` pero antes de enviar la solicitud debes seleccionar la opción `Headers` y agregar el key `x-access-token` con el valor devuelto en el campo `access_token` del paso anterior, por ejemplo:

```bash
curl --location --request GET 'localhost:3000/contacts/1' \
--header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjIyNTUxMjEzOTI3ZTE3NTUzZDg1ZjdkIiwidXNlcm5hbWUiOiJqcml2ZXJveCIsImlhdCI6MTY0Njk2NjEzNiwiZXhwIjoxNjQ2OTczMzM2fQ.Xu3P6Q5QetOLYy6a_BuwkrByDh99iS0Q0_9wjyUVfpk'
```
