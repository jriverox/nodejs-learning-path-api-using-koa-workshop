# Episodio 1: Creando un API rest con Node.js, Koa.js y MongoDB

Recuerda haber leìdo los requistos que necesitas instalar antes en la página [principal](../README.md#requisitos).

## Pasos para implementar

1. Creemos la carpeta raíz de nuestro proyecto, sugiero algo como `api-node-koa-workshop`
2. Abramos la carpeta con Visual Studio Code
3. Abre el terminal (puede ser de VS Code o el de tu preferencia pero debes dentro de la carpeta) e inicializa el nuevo proyecto npm, con el comando:

```bash
npm init -y
```

4. Instalamos las principales dependencias que usaremos: `koa` y algunas de su ecosistema, `mongoose` para conectarnos a MongoDB, `yenv` para manejar la configuarción en un yaml y `cross-env` para facilitar el manejo de la variable de entorno _NODE_ENV_), ejecuta el siguiente comando:

```bash
npm i koa koa-router koa-bodyparser koa-logger koa-json mongoose yenv cross-env
```

5. Instalemos `nodemon` para que escuche si cambiamos nuestro código y se reinicie nuestro servidor node, pero la instalaremos como _dependencia de desarrollo_ con el siguiente comando:

```bash
npm i --save-dev nodemon
```

6. _OPTIONAL_ Agreguemos el archivo `.editorconfig`. Abre de nuevo la Paleta de Comandos (`control + shift + p`) y escribe `editor` y selecciona la opción `Generate .editorconfig`. Este archivo nos permite especificar por ejemplo cuantos espacios tendran nuestros tabs para identar nuestro código.
7. _OPTIONAL_ Editemos el archivo `.editorconfig` y cambia el valor de `indent_size` a `2`
8. Ok, ahora creemos las carpetas que usaremos para estructurar nuestro proyecto:
9. Crea la carpeta `src` en la raiz del proyecto
10. Dentro de la carpeta `src` creamos las siguientes carpetas vacias para ir estructurando nuestro proyecto:

- `models`
- `controllers`
- `routes`

11. Dentro de la carpeta `models` creamos `contact.model.js` con el siguiente código:

```javascript
/**
 * contact.model.js
 * Nos permite gestionar los datos de la colección contacts de MongoDB
 */
const mongoose = require("mongoose");

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
    collection: "contacts",
  }
);

const contactModel = model("ContactModel", contactSchema);
module.exports = contactModel;
```

14. Dentro de la carpeta `controllers` creamos `contacts.controller.js` con el siguiente código:

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
  const found = await contactModel.exists(filter);

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

12. Dentro de la carpeta `routes` creamos `contacts.route.js` con el siguiente código:

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

13. Ahora necesitamos un par de archivos más para poner andar el proyecto :walking:, creamos el archivo `routes.js` dentro de `src` con el siguiente codigo:

```javascript
/**
 * Expone una coleccion de todos los routes de nuestra api,
 * a pesar de que aqui solo se se expone personRoute en la vida real debería exponer todos .
 */
const personRoute = require("./routes/contacts.route");
// aqui podria exponer todos los routes, ejemplo module.exports = [personRoute, route2]
module.exports = [personRoute];
```

14. Ahora debemos crear el archivo responsable por inicial la aplicación, creamos el archivo `server.js` dentro de `src`

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

15. Agreguemos el archivo de configuración `env.yaml` a la raiz del proyecto, con el siguiente código:

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

16. Ahora agregaremos el nombre del archivo `env.yaml` al archivo `.gitignore`, esto es una mejor práctica, ya que nunca debemos exponer credenciales o datos sensibles a repositorios publicos. Simplemente abre el archivo y agrega en una linea nueva `env.yaml`

## Probemos nuestra API

Hasta aquí hemos implementado el código para construir nuestra api, pero y como :smiling_imp: puedo ponerla en marcha y probarla!!

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

:speech_balloon: Nota: si ya existe una persona con index usado entonce se actualizaran los datos, de lo contrario se creará, aqui puedes probar con diferentes valores.

## Configuración de ESlint y Prettier

### EsLint

1. Instalemos `eslint` como dependencia de desarrollo:

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

6. Edita el archivo `package.json` y agrega las siguientes lineas a la sección `scripts`, las cuales nos permitiran ejecutar la comprobación si nuestro codigo cumple con los estandares y reglas de eslint:

```json
"lint:show": "eslint src/ -f stylish",
"lint:fix": "eslint --fix --ext .js .",
```

7. Revisemos si tenemos errores que no satisfagan las reglas de eslint, ejecutemos el comando:

```bash
npm run lint:show
```

:speech_balloon: Nota: si tenemos errores se mostraran como resultado en la consola, donde se nos indicaran el archivo y la linea.

8. Si tenemos errores, intentemos arreglarlos automaticamente ejecutando el script:

```bash
npm run lint:fix
```

9. Vuelve a ejecutar el comando: `npm run lint:show` y veras que no tienes errores o bajo la cantidad
10. Probemos nuestro código de nuevo: ejecuta `npm start` y accede por postman o el browser a <http://localhost:3000/contacts/>
