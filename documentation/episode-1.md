# Episodio 1

Recuerda haber leìdo los requistos que necesitas instalar antes en la página [principal](../README.md#requisitos).

## Pasos para implementar

1. Creemos la carpeta raíz de nuestro proyecto, sugiero algo como **_api-node-koa-workshop_**
2. Abramos la carpeta con Visual Studio Code
3. Abre el terminal (puede ser de VS Code o el de tu preferencia pero debes dentro de la carpeta) e inicializa el nuevo proyecto npm, con el comando:

```bash
npm init -y
```

4. Instalemos las principales dependencias que usaremos (**_koa_** y algunas del su ecosistema, **_mongoose_** para conectarnos a MongoDB, **_yenv_** para manejar la configuarción en un yaml y **_cross-env_** para facilitar el manejo de la variable de entorno **_NODE_ENV_**), ejecuta el siguiente comando:

```bash
npm i koa koa-router koa-bodyparser koa-logger koa-json mongoose yenv cross-env
```

5. Instalemos **_nodemon_** para que escuche si cambiamos nuestro codigo y se reinicie nuestro servidor node, pero la instalaremos como _dependencia de desarrollo_ con el siguiente comando:

```bash
npm i --save-dev nodemon
```

6. **_OPTIONAL_** Solo en caso que ya no tengas un repositorio git. Inicialicemos ahora un nuevo repositorio git para congelar el codigo de cada episodio, usando el comando:

```bash
git init
```

7. **_OPTIONAL_** Solo en caso que no tengas un .gitignore configurado. Ahora agreguemos el archivo _.gitignore_ necesario para no subir al repositorio archivos innecsarios como los modulos npm, apoyate en el pluging gitignore que instalamos en los requisitos. Abre la Paleta de Comandos (**_control + shift + p_**) y escribe **_gitignore_**, y selecciona **_Add gitignore_** y luego escribe **_node_** en el cuadro de texto.
8. **_OPTIONAL_** Agreguemos el archivo _.editorconfig_. Abre de nuevo la Paleta de Comandos (**_control + shift + p_**) y escribe **_editor_** y selecciona la opción **_Generate .editorconfig_**. Este archivo nos permite especificar por ejemplo cuantos espacios tendran nuestros tabs para identar nuestro código.
9. **_OPTIONAL_** Editemos el archivo **_.editorconfig_** y cambia el valor de **_indent_size_** a **2**
10. Ok, ahora creemos las carpetas que usaremos para estructurar nuestro proyecto:
11. Crea la carpeta **_src_** en la raiz del proyecto
12. Dentro de la carpeta _src_ creamos las siguientes carpetas vacias para ir estructurando nuestro proyecto:

- **_models_**
- **_controllers_**
- **_routes_**

13. Dentro de la carpeta _models_ creamos **_contact.model.js_** con el siguiente código:

```javascript
/**
 * contact.model.js
 * Nos permite gestionar los datos de la colección contacts de MongoDB
 */
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    index: {
      type: Number,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
    },
    jobPosition: {
      type: String,
      required: false,
    },
    roles: [String],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'contacts',
  },
);

const contactModel = model('ContactModel', contactSchema);
module.exports = contactModel;
```

14. Dentro de la carpeta _controllers_ creamos **_contacts.controller.js_** con el siguiente código:

```javascript
const contactModel = require('../models/contact.model');

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
 * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
 */
module.exports.getContactByIndex = async (ctx) => {
  const { index } = ctx.params;

  const filter = { index: parseInt(index, 10) };
  const data = await contactModel.findOne(filter);
  if (data) {
    ctx.body = data;
  } else {
    // codigo agregado en este paso: Manejamos los errores operacionales usando nuestra fabrica de errores
    ctx.throw(404, `No se ha encontrado la contacto con el indice ${index}`);
  }
};

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros
 * de la solicitud, en este caso desde el body,
 * obtendremos las propiedades de la contacto a guardar a traves de ctx.request.body
 */
module.exports.updateContact = async (ctx) => {
  const { index } = ctx.params;
  const contact = ctx.request.body;
  const filter = { index: parseInt(index, 10) };
  const options = { upsert: false };
  const found = await contactModel.exists(filter);

  if (!found) {
    ctx.throw(404, `No se ha encontrado la contacto con el indice ${index}`);
  } else {
    await contactModel.updateOne(filter, contact, options);
    ctx.body = contact;
  }
};

module.exports.createContact = async (ctx) => {
  const { index } = await contactModel.findOne({}, 'index', { sort: { index: -1 } });
  const contact = { ...ctx.request.body, index: index + 1 };
  await contactModel.create(contact);
  ctx.body = contact;
  ctx.response.status = 201;
};
```

15. Dentro de la carpeta _routes_ creamos **_contacts.route.js_** con el siguiente código:

```javascript
const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const {
  getContactByIndex,
  updateContact,
  createContact,
} = require('../controllers/contacts.controller');

// GET /contacts/29
router.get('/byIndex', '/:index', getContactByIndex);

// POST /contacts/
router.post('/post', '/', createContact);

// PUT /contacts/29
router.put('/put', '/:index', updateContact);

module.exports = router;
```

16. Ahora necesitamos un par de archivos más para poner andar el proyecto :walking:, creamos el archivo **_routes.js_** dentro de _src_ con el siguiente codigo:

```javascript
/**
 * Expone una coleccion de todos los routes de nuestra api,
 * a pesar de que aqui solo se se expone personRoute en la vida real debería exponer todos .
 */
const personRoute = require('./routes/contacts.route');
// aqui podria exponer todos los routes, ejemplo module.exports = [personRoute, route2]
module.exports = [personRoute];
```

17. Ahora crearemos el archivo responsable por inicial la aplicación :zap:, creamos el archivo ***server.js*** dentro de *src*

```javascript
/* eslint-disable no-console */
/**
 * server.js
 * Responsable por inciar nuestra api, inicializa koa con todos sus middleware y tambien inicialzia la conexión de bd
 */
const Koa = require('koa');
const json = require('koa-json');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const yenv = require('yenv');
const mongoose = require('mongoose');

const env = yenv();
const routes = require('./routes');

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa();
// Inicializar los middleware
app.use(bodyParser()).use(json()).use(logger());

// eslint-disable-next-line array-callback-return
routes.map((item) => {
  app.use(item.routes()).use(item.allowedMethods());
});
// abrir la conexión con MongoDB
mongoose
  .connect(env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => {
    // iniciar el servidor koa para que empiece a escuchar peticiones
    app.listen(env.PORT, () => {
      console.log(`Escuchando en el puerto ${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
```

18. Agreguemos el archivo de configuración **_env.yaml_** a la raiz del proyecto, con el siguiente coódigo:

```yaml
development:
  PORT: 3000
  MONGODB_URL: 'mongodb://localhost:27017/contacts_demo'
production:
  PORT: 3000
  MONGODB_URL: 'mmongodb+srv://tu-usuario:tu-contraseña@cluster0-8hxu4.mongodb.net/contacts?retryWrites=true&w=majority'
```

:speech_balloon: **Notas:** el archivo **_env.yaml_** contiene las variables de entorno que usará nuestro codigo, en este caso PORT y MONGODB_URL. Este env.yaml tiene 2 ambientes (development y production), para que nuestra aplicación corra, Nodejs y la libreria yenv necesitan un valor en la variable de entorno _NODE_ENV_, esta variable define el ambiente que usaremos (en este caso development). En los siguientes pasos agregaremos en la sección scripts del archivo package.json varios scrips, por ejemplo _start_ alli contendrá un valor como: _"cross-env NODE_ENV=development nodemon ./src/server.js"_ lo que significa que cross-env ya establece esta variable NODE_ENV a _development_.

Otro punto importante acerca de la variable _MONGODB_URL_ la cual contiene la cadena de conexión de la BD de MongoDB, el valor que deberás establecer dependerá de donde estes ejecutando la BD y si tiene credenciales o no. En el caso mostrado mas arriba (mongodb://localhost:27017/contacts_demo) no tiene ni password ni usuario, esto es una práctica insegura pero obviamente para fines de prueba está bien.

19. Ahora agregaremos el nombre del archivo **_env.yaml_** al archivo **_.gitignore_**, esto es una mejor práctica, ya que nunca debemos exponer credenciales o datos sensibles a repositorios publicos. Simplemente abre el archivo y agrega en una linea nueva _env.yaml_

## Probemos nuestra API

Hasta aquí hemos implementado el código para construir nuestra api, pero y como :smiling_imp: puedo ponerla en marcha y probarla!!

1. Abrimos el archivo **_package.json_** que esta en la raiz y agrega dentro de la sección **_scripts_** la siguiente linea:

```json
"start": "cross-env NODE_ENV=development nodemon ./src/server.js",
```

2. Para iniciar nuestra aplicación ejecutamos el comando:

```bash
npm start
```

Si todo sale bien :v:

```bash
[nodemon] 2.0.15
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node ./src/server.js`
Escuchando en el puerto 3000
```

:speech_balloon: **Nota**: Recordemos que hemos implementado dentro de person.route un GET para buscar una persona por el index y un POST que nos permite crear o actualizar los datos de una persona.

3. Para probar nuetros _GET_ abre por el browser o por postman el siguiente link

```
http://localhost:3000/contacts/1
```

4. Si hicimos todo bien, entonces veremos un json con los datos de la persona buscada:

```json
{
  "address": {
    "street": "99 Morgan Avenue",
    "city": "Coaldale",
    "state": "American Samoa"
  },
  "_id": "6224253fa95bb89472b4cdda",
  "index": 1,
  "dateOfBirth": "1994-10-26",
  "firstName": "Farrell",
  "lastName": "Farrell",
  "username": "farrell.farrell",
  "company": "Terascape",
  "email": "farrell.farrell@terascape.com",
  "phone": "+1 415 603 2862",
  "jobPosition": "Manager",
  "roles": ["owner"],
  "active": true
}
```

5. Para probar el _POST_, debemos acceder por **_Postman_**, selecciona en la lista de verbos **_POST_**.

6. Selecciona **_Body_**, luego la opción **_raw_** y luego en la lista de la derecha seleciona **_JSON_**, pega el siguiente codigo:
   Introduce algún cambio en algún campo para comprobar que se actualiza.

```json
{
  "address": {
    "street": "99 Morgan Avenue",
    "city": "Coaldale",
    "state": "American Samoa"
  },
  "index": 1,
  "dateOfBirth": "1994-10-26",
  "firstName": "Farrell",
  "lastName": "Farrell",
  "username": "farrell.farrell",
  "company": "Terascape",
  "email": "farrell.farrell@terascape.com",
  "phone": "+1 415 603 2862",
  "jobPosition": "Manager",
  "roles": ["owner"],
  "active": true
}
```

:speech_balloon: **Nota**: si ya existe una persona con index usado entonce se actualizaran los datos, de lo contrario se creará, aqui puedes probar con diferentes valores.

## Configuración de ESlint y Prettier

### EsLint

1. Instalemos **_eslint_** como dependencia de desarrollo:

```bash
npm i --save-dev eslint
```

2. Inicialicemos eslint con el siguiente comando:

```bash
npx eslint --init
```

:speech_balloon: **Nota:**
_npx_ nos permite ejecutar scripts de paquetes que se encuentra dentro del proyecto (carpeta _node_modules_) la cual es donde se instalan las librerias que instalemos con npm i o npm install.

3. Cuando ejecutamos el comando anterior, se nos presenta una serie de preguntas que debemos elegir, para efectos de este demos, seleccionar los siguiente:

- To check syntax, find problems, and enforce code style
- CommonJs
- Node of these
- Does your project use TypeScript (N)
- Desmarcar Browser () y marcar Node (x)
- Use a popular style guide
- Estilo: (Airbnb)
- (Formato del archivo de configuración) (YAML)
- Instalar dependencias necesarass (Y)

### Prettier

Recuerda haber instalado el plugin de prettier (mencionado en los requisitos) 4. Instalamos **_Prettier_** como dependencia de desarrollo:

```bash
npm i --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

5. Creemos el archivo **_.prettierrc.js_** en la raiz del proyecto y lo editamos con el siguiente codigo:

```javascript
module.exports = {
  endOfLine: 'lf',
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'auto',
};
```

6. Editemos el archivo de configuración de eslint **_.eslintrc.yml_** para que tenga los plugins y las extensiones de prettier, reemplaza el contenido por:

```yaml
env:
  browser: true
  node: true
  commonjs: true
  es2021: true
extends:
  - airbnb-base
  - eslint:recommended
  - prettier
parserOptions:
  ecmaVersion: latest
plugins:
  - prettier
rules: {}
```

7. Edita el archivo **_package.json_** y agrega las siguientes lineas a la sección **_scripts_**, las cuales nos permitiran ejecutar la comprobación si nuestro codigo cumple con los estandares y reglas de eslint:

```json
"lint:show": "eslint src/ -f stylish",
"lint:fix": "eslint --fix --ext .js .",
```

8. Revisemos si tenemos errores que no satisfagan las reglas de eslint, ejecutemos el comando:

```bash
npm run lint:show
```

:speech_balloon: **Nota**: si tenemos errores se mostraran como resultado en la consola, donde se nos indicaran el archivo y la linea. 8. Si tenemos errores, intentemos arreglarlos automaticamente ejecutando el script:

```bash
npm run lint:fix
```

9. Vuelve a ejecutar el comando: **_npm run lint:show_** y veras que no tienes errores o bajo la cantidad
10. Probemos nuestro código de nuevo: ejecuta **_npm start_** y accede por postman o el browser a http://localhost:3000/contacts/29
