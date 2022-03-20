# Episodio 1: Creando un API rest con Node.js, Koa.js y MongoDB <!-- omit in toc -->

## Contenido <!-- omit in toc -->

- [Introducción](#introducción)
- [Antes de empezar](#antes-de-empezar)
- [Implementación](#implementación)
- [Probemos nuestra API](#probemos-nuestra-api)
- [Configuración de ESlint y Prettier](#configuración-de-eslint-y-prettier)
  - [EsLint](#eslint)
  - [Prettier](#prettier)

## Introducción

En este episodio construiremos un API rest muy simple que nos ayduará a entender las bases de un proyecto del mundo real. Como lo mencioné en el readme de este repositorio, usaremos Node.js, Koa.js y MongoDB (obviamente con el apoyo de algunas librerías). Ten en cuenta que comprender las bases nos facilitaran el camnimo si tenemos que usar cualquier otro framework http como Express.js, Fastify, Restify. Asímismo si tuvieras que usar cualquier otra base de datos como MySQL, SQL Server, Postgresql.

## Antes de empezar

Recuerda haber leído los `requisitos` que necesitas instalar antes en la página [principal](../README.md#requisitos).

## Implementación

1. Creemos la carpeta raíz de nuestro proyecto, sugiero algo como `api-node-koa-workshop`
2. Abramos la carpeta con Visual Studio Code
3. Abre el terminal (puede ser de VS Code o el de tu preferencia, pero debes dentro de la carpeta) e inicializa el nuevo proyecto npm, con el comando:

```bash
npm init -y
```

4. Instalamos las principales dependencias que usaremos: `koa` y algunas de su ecosistema, `mongoose` para conectarnos a MongoDB, `yenv` para manejar la configuración en un yaml y `cross-env` para facilitar el manejo de la variable de entorno _NODE_ENV_), ejecuta el siguiente comando:

```bash
npm i koa koa-router koa-bodyparser koa-logger koa-json mongoose yenv cross-env
```

5. Instalemos `nodemon` para que escuche si cambiamos nuestro código y se reinicie nuestro servidor node, pero la instalaremos como _dependencia de desarrollo_ con el siguiente comando:

```bash
npm i --save-dev nodemon
```

6. _OPTIONAL_ Agreguemos el archivo `.editorconfig`. Abre de nuevo la Paleta de Comandos (`control + shift + p`) y escribe `editor` y selecciona la opción `Generate .editorconfig`. Este archivo nos permite especificar por ejemplo cuantos espacios tendrán nuestros tabs para indentar nuestro código.
7. _OPTIONAL_ Editemos el archivo `.editorconfig` y cambia el valor de `indent_size` a `2`
8. Ok, ahora creemos las carpetas que usaremos para estructurar nuestro proyecto:
9. Crea la carpeta `src` en la raíz del proyecto
10. Dentro de la carpeta `src` creamos las siguientes carpetas vacías para ir estructurando nuestro proyecto:

- `models`
- `controllers`
- `routes`

11.  Dentro de la carpeta `models` creamos `contact.model.js` en el cual usaremos mongoose como repositorio para enviarle las peticiones a MongDB a la colección de contacts.

```javascript
/**
 * contact.model.js
 * Nos permite gestionar los datos de la colección contacts de MongoDB
 */

const { Schema, model } = require("mongoose");

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
    collection: "contacts",
  }
);

const contactModel = model("ContactModel", contactSchema);
module.exports = contactModel;
```

12.  Dentro de la carpeta `controllers` creamos `contacts.controller.js` el cual será el encargado de recibir las peticiones y aplicar la lógica de negocio y finalmente invocar a la capa de datos (modelos).
```javascript
const contactModel = require("../models/contact.model");

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
  const found = await contactModel.findOne(filter);

  if (!found) {
    ctx.throw(404, `No se ha encontrado la contacto con el indice ${index}`);
  } else {
    await contactModel.updateOne(filter, contact, options);
    ctx.body = contact;
  }
};

module.exports.createContact = async (ctx) => {
  const { index } = await contactModel.findOne({}, "index", {
    sort: { index: -1 },
  });
  const contact = { ...ctx.request.body, index: index + 1 };
  await contactModel.create(contact);
  ctx.body = contact;
  ctx.response.status = 201;
};
```

13.  Dentro de la carpeta `routes` creamos `contacts.route.js`, este archivo contendrá las declaraciones de los endpoints o rutas para /contacts (GET, POST, PUT), recibe las peticiones directamente y ejecuta todos los middleware hasta invocar al controlador:

```javascript
const KoaRouter = require("koa-router");

const router = new KoaRouter({ prefix: "/contacts" });
const {
  getContactByIndex,
  updateContact,
  createContact,
} = require("../controllers/contacts.controller");

// GET /contacts/29
router.get("/byIndex", "/:index", getContactByIndex);

// POST /contacts/
router.post("/post", "/", createContact);

// PUT /contacts/29
router.put("/put", "/:index", updateContact);

module.exports = router;
```

14. Ahora necesitamos un par de archivos más para poner andar el proyecto :walking:, creamos el archivo `routes.js` dentro de `src` con el siguiente codigo:

```javascript
/**
 * Expone una coleccion de todos los routes de nuestra api,
 * a pesar de que aqui solo se se expone personRoute en la vida real debería exponer todos .
 */
const personRoute = require("./routes/contacts.route");
// aqui podria exponer todos los routes, ejemplo module.exports = [personRoute, route2]
module.exports = [personRoute];
```

15. Ahora debemos crear el archivo responsable por inicial la aplicación, creamos el archivo `server.js` dentro de `src`

```javascript
/* eslint-disable no-console */
/**
 * server.js
 * Responsable por inciar nuestra api, inicializa koa con todos sus middleware y tambien inicialzia la conexión de bd
 */
const Koa = require("koa");
const json = require("koa-json");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const yenv = require("yenv");
const mongoose = require("mongoose");

const env = yenv();
const routes = require("./routes");

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa();
// Inicializar los middleware
app.use(bodyParser()).use(json()).use(logger());

routes.forEach((item) => {
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

16. Agreguemos el archivo de configuración `env.yaml` a la raiz del proyecto, con el siguiente código:

```yaml
development:
  PORT: 3000
  MONGODB_URL: "mongodb://localhost:27017/contacts_demo"
production:
  PORT: 3000
  MONGODB_URL: "mmongodb+srv://tu-usuario:tu-contraseña@cluster0-8hxu4.mongodb.net/contacts?retryWrites=true&w=majority"
```

:speech_balloon: Notas: el archivo `env.yaml` contiene las variables de entorno que usará nuestro codigo, en este caso PORT y MONGODB_URL. Este env.yaml tiene 2 ambientes (development y production), para que nuestra aplicación corra, Nodejs y la libreria `yenv` necesitan un valor en la variable de entorno `NODE_ENV`, esta variable define el ambiente que usaremos (en este caso development). En los siguientes pasos agregaremos en la sección scripts del archivo package.json varios scrips, por ejemplo `start` alli contendrá un valor como: `cross-env NODE_ENV=development nodemon ./src/server.js` lo que significa que cross-env ya establece esta variable NODE_ENV a `development`.

Otro punto importante acerca de la variable `MONGODB_URL` la cual contiene la cadena de conexión de la BD de MongoDB, el valor que deberás establecer dependerá de donde estes ejecutando la BD y si tiene credenciales o no. En el caso mostrado mas arriba (mongodb://localhost:27017/contacts_demo) no tiene ni password ni usuario, esto es una práctica insegura pero obviamente para fines de prueba está bien.

17. Ahora agregaremos el nombre del archivo `env.yaml` al archivo `.gitignore`, esto es una mejor práctica, ya que nunca debemos exponer credenciales o datos sensibles a repositorios publicos. Simplemente abre el archivo y agrega en una linea nueva `env.yaml`

## Probemos nuestra API

Hasta aquí hemos implementado el código para construir nuestra api, pero y como puedo ponerla en marcha y probarla!!

:eight_spoked_asterisk: Nota: te recuerdo nuevamente que deberías disponer de una base de datos en MongoDB y que en la sección [Requisitos/Super Importante del Readme principal](../README.md#super-importante) encontrás como ejecutar Mongo en Docker y crear una base de datos, así como importar los datos desde un json de ejemplo que he puesto a disposición.

1. Abrimos el archivo `package.json` que esta en la raiz y agrega dentro de la sección `scripts` la siguiente linea:

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

:speech_balloon: Nota: Recordemos que hemos implementado dentro de person.route un GET para buscar una persona por el index y un POST que nos permite crear o actualizar los datos de una persona.

3. Para probar nuetros `GET` abre por el browser o por postman el siguiente link

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

5. Para probar el `POST`, debemos acceder por `Postman`, selecciona en la lista de verbos `POST`.

6. Selecciona `Body`, luego la opción `raw` y luego en la lista de la derecha seleciona `JSON`, pega el siguiente codigo:
   Introduce algún cambio en algún campo para comprobar que se actualiza.

```json
{
  "address": {
    "street": "99 Morgan Avenue",
    "city": "Coaldale",
    "state": "American Samoa"
  },
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

:speech_balloon: Notas importantes:

- Cuando envias una petición ya sea por el navegador o por postman, el código de `server.js` crea una instancia de koa y la inicializa con una configuración en la cual se cargan los routes configurados en `routes/contacts.route.js`, fíjate que allí se ha configurado un `GET` un `POST` y un `PUT`.
- Si la petición (verbo http + ruta + parametros) coiciden con una definición de algun route, entonces el route ejecuta los middleware (funciones) incluyendo la invocación del método del controlador que le coresponda. Por ejemplo *router.get("/byIndex", "/:index", getContactByIndex);* escucha in GET /contacts/ siempre y cuando le pasen un numero en el url (params) y lo manda al método `getContactByIndex` del controlador `contacts.controller.js`.
- Luego el controlador ejecuta su lógica de negocios incluso invocando al método findOne del modelo `contacts.model.js` y este a su vez se conecta con Mongo para hacer el query.
- También puede enviar un PUT similar como lo hiciste en el paso 6 pero en el url debes poner el numero del campo index, por ejemplo `PUT contacts/1` obviamente con su body.

## Configuración de ESlint y Prettier
ESLint y prettier son herramientas que nos van a ayudar a tener orden en el código, ya que en javascript es muy fácil caer rapidamente en desorden y que el código se convierta en menos legible, esto incrementaría la deuda técnica. Esta desorden se conoce como `entropía`.

### EsLint

1. Instalemos `eslint` como dependencia de desarrollo, si la aplciacón aún está en ejecución cancelala.

```bash
npm i --save-dev eslint
```

2. Inicialicemos eslint con el siguiente comando:

```bash
npx eslint --init
```

:speech_balloon: Nota:
`npx` nos permite ejecutar los paquetes npm que se encuentra dentro del proyecto (carpeta `node_modules`) la cual es donde se instalan las librerias que instalemos con npm i o npm install. Por el contrario si en este caso hubieras instalado eslint de manera globlal (por ejemplo: `npm i -G eslint`) entonces podrías usar `npm eslint --init` en lugar de usar `npx eslint --init`.

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

Recuerda haber instalado el plugin de prettier (mencionado en los requisitos) 4. Instalamos `Prettier` como dependencia de desarrollo:

```bash
npm i --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

4. Creemos el archivo `.prettierrc.js` en la raiz del proyecto y lo editamos con el siguiente codigo:

```javascript
module.exports = {
  endOfLine: "lf",
  semi: true,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: "auto",
};
```

5. Editemos el archivo de configuración de eslint `.eslintrc.yml` para que tenga los plugins y las extensiones de prettier, reemplaza el contenido por:

```yaml
env:
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

6. Edita el archivo `package.json` y agrega las siguientes lineas a la sección `scripts`, las cuales nos permitiran ejecutar la comprobación si nuestro codigo cumple con los estandares y reglas de eslint:

```json
"lint:show": "eslint src/ -f stylish",
"lint:fix": "eslint --fix --ext .js ."
```

7. Revisemos si tenemos errores que no satisfagan las reglas de eslint, ejecutemos el comando:

```bash
npm run lint:show
```

:speech_balloon: Nota: si tenemos errores se mostraran como resultado en la consola, donde se nos indicaran el archivo y la línea.

8. Si tenemos errores, intentemos arreglarlos automáticamente ejecutando el script:

```bash
npm run lint:fix
```

9. Vuelve a ejecutar el comando: `npm run lint:show` y veras que no tienes errores o bajo la cantidad
10. Probemos nuestro código de nuevo: ejecuta `npm start` y accede por postman o el browser a <http://localhost:3000/contacts/>
