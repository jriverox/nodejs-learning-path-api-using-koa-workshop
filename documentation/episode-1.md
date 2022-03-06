# Episodio 1

Recuerda haber leìdo los requistos que necesitas instalar antes en la página [principal](../README.md#requisitos).

## Pasos para implementar

1. Creemos la carpeta raíz de nuestro proyecto, sugiero algo como <kbd>api-node-koa-workshop</kbd>
2. Abramos la carpeta con Visual Studio Code
3. Abre el terminal (puede ser de VS Code o el de tu preferencia pero debes dentro de la carpeta) e inicializa el nuevo proyecto npm, con el comando:

```bash
npm init -y
```
4. Instalemos las principales dependencias que usaremos (<kbd>koa</kbd> y algunas del su ecosistema, <kbd>mongoose</kbd> para conectarnos a MongoDB, <kbd>yenv</kbd> para manejar la configuarción en un yaml y <kbd>cross-env</kbd> para facilitar el manejo de la variable de entorno <kbd>NODE_ENV</kbd>), ejecuta el siguiente comando:

```bash
npm i koa koa-router koa-bodyparser koa-logger koa-json mongoose yenv cross-env
```
5. Instalemos <kbd>nodemon</kbd> para que escuche si cambiamos nuestro codigo y se reinicie nuestro servidor node, pero la instalaremos como *dependencia de desarrollo* con el siguiente comando:
```bash
npm i --save-dev nodemon
```
6. ***OPTIONAL*** Solo en caso que ya no tengas un repositorio git. Inicialicemos ahora un nuevo repositorio git para congelar el codigo de cada episodio, usando el comando:
```bash
git init
```
7. ***OPTIONAL*** Solo en caso que no tengas un .gitignore configurado. Ahora agreguemos el archivo *.gitignore* necesario para no subir al repositorio archivos innecsarios como los modulos npm, apoyate en el pluging gitignore que instalamos en los requisitos. Abre la Paleta de Comandos (<kbd>control + shift + p</kbd>) y escribe <kbd>gitignore</kbd>, y selecciona <kbd>Add gitignore</kbd> y luego escribe <kbd>node</kbd> en el cuadro de texto.
8. ***OPTIONAL*** Agreguemos el archivo *.editorconfig*. Abre de nuevo la Paleta de Comandos (<kbd>control + shift + p</kbd>) y escribe <kbd>editor</kbd> y selecciona la opción <kbd>Generate .editorconfig</kbd>. Este archivo nos permite especificar por ejemplo cuantos espacios tendran nuestros tabs para identar nuestro código.
9. ***OPTIONAL*** Editemos el archivo <kbd>.editorconfig</kbd> y cambia el valor de <kbd>indent_size</kbd> a **2**
10.  Ok, ahora creemos las carpetas que usaremos para estructurar nuestro proyecto:
11.  Crea la carpeta <kbd>src</kbd> en la raiz del proyecto
12.  Dentro de la carpeta *src* creamos las siguientes carpetas vacias para ir estructurando nuestro proyecto:
  - <kbd>models</kbd>
  - <kbd>controllers</kbd>
  - <kbd>routes</kbd>
13. Dentro de la carpeta *models* creamos <kbd>contact.model.js</kbd> con el siguiente código:
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
14. Dentro de la carpeta *controllers* creamos <kbd>contacts.controller.js</kbd> con el siguiente código:
```javascript
const contactModel = require('../models/contact.model');
/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
 * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
 */
module.exports.getByIndex = async (ctx) => {
  const index = ctx.params.index && !Number.isNaN(ctx.params.index) ? parseInt(ctx.params.index, 10) : 0;

  if (index > 0) {
    const filter = { index };
    const data = await contactModel.findOne(filter);
    if (data) {
      ctx.body = data;
    } else {
      ctx.throw(404, `No se ha encontrado la persona con el indice ${index}`);
    }
  } else {
    ctx.throw(422, `Valor ${ctx.params.index} no soportado`);
  }
};

/**
 *
 * @param {object} ctx: contexto de koa que contiene los parameteros
 * de la solicitud, en este caso desde el body,
 * obtendremos las propiedades de la persona a guardar a traves de ctx.request.body
 */
module.exports.save = async (ctx) => {
  const contact = ctx.request.body;
  const filter = { index: contact.index };
  const options = { upsert: true };
  await contactModel.updateOne(filter, contact, options);
  ctx.body = contact;
};

```
15. Dentro de la carpeta *routes* creamos <kbd>contacts.route.js</kbd> con el siguiente código:
```javascript
const KoaRouter = require('koa-router');

const router = new KoaRouter({ prefix: '/contacts' });
const { getByIndex, save } = require('../controllers/contacts.controller');

// GET /contacts/29
router.get('/byIndex', '/:index', getByIndex);

// POST
router.post('/post', '/', save);

module.exports = router;

```
16. Ahora necesitamos un par de archivos más para poner andar el proyecto :walking:, creamos el archivo <kbd>routes.js</kbd> dentro de *src* con el siguiente codigo:
```javascript
/**
 * Expone una coleccion de todos los routes de nuestra api,
 * a pesar de que aqui solo se se expone personRoute en la vida real debería exponer todos .
 */
const personRoute = require('./routes/contacts.route');
// aqui podria exponer todos los routes, ejemplo module.exports = [personRoute, route2]
module.exports = [personRoute];

```
17. Ahora crearemos el archivo responsable por inicial la aplicación :zap:, creamos el archivo <kbd>server.js</kbd> dentro de *src*
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
18. Agreguemos el archivo de configuración <kbd>env.yaml</kbd> a la raiz del proyecto, con el siguiente coódigo:
```yaml
development:
    PORT: 3000
    MONGODB_URL: "mongodb://localhost:27017/contacts_demo"
production:
    PORT: 3000
    MONGODB_URL: "mmongodb+srv://tu-usuario:tu-contraseña@cluster0-8hxu4.mongodb.net/contacts?retryWrites=true&w=majority"

```
:speech_balloon: **Notas:** el archivo ***env.yaml*** contiene las variables de entorno que usará nuestro codigo, en este caso PORT y MONGODB_URL. Este env.yaml tiene 2 ambientes (development y production), para que nuestra aplicación corra, Nodejs y la libreria yenv necesitan un valor en la variable de entorno *NODE_ENV*, esta variable define el ambiente que usaremos (en este caso development). En los siguientes pasos agregaremos en la sección scripts del archivo package.json varios scrips, por ejemplo *start* alli contendrá un valor como: *"cross-env NODE_ENV=development nodemon ./src/server.js"* lo que significa que cross-env ya establece esta variable NODE_ENV a *development*.

Otro punto importante acerca de la variable *MONGODB_URL* la cual contiene la cadena de conexión de la BD de MongoDB, el valor que deberás establecer dependerá de donde estes ejecutando la BD y si tiene  credenciales o no. En el caso mostrado mas arriba (mongodb://localhost:27017/contacts_demo) no tiene ni password ni usuario, esto es una práctica insegura pero obviamente para fines de prueba está bien.

19. Ahora agregaremos el nombre del archivo <kbd>env.yaml</kbd> al archivo <kbd>.gitignore</kbd>, esto es una mejor práctica, ya que nunca debemos exponer credenciales o datos sensibles a repositorios publicos. Simplemente abre el archivo y agrega en una linea nueva *env.yaml*

## Probemos nuestra API

Hasta aquí hemos implementado el código para construir nuestra api, pero y como :smiling_imp: puedo ponerla en marcha y probarla!! 
1. Abrimos el archivo <kbd>package.json</kbd> que esta en la raiz y agrega dentro de la sección <kbd>scripts</kbd> la siguiente linea:
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

3. Para probar nuetros *GET* abre por el browser o por postman el siguiente link
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
    "roles": [
        "owner"
    ],
    "active": true
}
```
5. Para probar el *POST*, debemos acceder por <kbd>Postman</kbd>, selecciona en la lista de verbos <kbd>POST</kbd>.

8. Selecciona <kbd>Body</kbd>, luego la opción <kbd>raw</kbd> y luego en la lista de la derecha seleciona <kbd>JSON</kbd>, pega el siguiente codigo:
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
    "roles": [
        "owner"
    ],
    "active": true
}
```
:speech_balloon: **Nota**: si ya existe una persona con index usado entonce se actualizaran los datos, de lo contrario se creará, aqui puedes probar con diferentes valores.

## Configuración de ESlint y Prettier
### EsLint
1. Instalemos <kbd>eslint</kbd> como dependencia de desarrollo:
```bash
npm i --save-dev eslint
```
2. Inicialicemos eslint con el siguiente comando:
```bash
npx eslint --init
```
:speech_balloon: **Nota:** 
*npx* nos permite ejecutar scripts de paquetes que se encuentra dentro del proyecto (carpeta *node_modules*) la cual es donde se instalan las librerias que instalemos con npm i o npm install.

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
Recuerda haber instalado el plugin de prettier (mencionado en los requisitos)
4. Instalamos <kbd>Prettier</kbd> como dependencia de desarrollo:
```bash
npm i --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```
5. Creemos el archivo <kbd>.prettierrc.js</kbd> en la raiz del proyecto y lo editamos con el siguiente codigo:
```javascript
module.exports = {
  "endOfLine": "lf",
  semi: true,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: "auto"
};
```
6. Editemos el archivo de configuración de eslint <kbd>.eslintrc.yml</kbd> para que tenga los plugins y las extensiones de prettier, reemplaza el contenido por:
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
7. Edita el archivo <kbd>package.json</kbd> y agrega las siguientes lineas a la sección <kbd>scripts</kbd>, las cuales nos permitiran ejecutar la comprobación si nuestro codigo cumple con los estandares y reglas de eslint:
```json
"lint:show": "eslint src/ -f stylish",
"lint:fix": "eslint --fix --ext .js .",
```
8. Revisemos si tenemos errores que no satisfagan las reglas de eslint, ejecutemos el comando:
```bash
npm run lint:show
```
:speech_balloon: **Nota**: si tenemos errores se mostraran como resultado en la consola, donde se nos indicaran el archivo y la linea.
8. Si tenemos errores, intentemos arreglarlos automaticamente ejecutando el script:
```bash
npm run lint:fix
```
9. Vuelve a ejecutar el comando: <kbd>npm run lint:show</kbd> y veras que no tienes errores o bajo la cantidad
10. Probemos nuestro código de nuevo: ejecuta <kbd>npm start</kbd> y accede por postman o el browser a http://localhost:3000/contacts/29
