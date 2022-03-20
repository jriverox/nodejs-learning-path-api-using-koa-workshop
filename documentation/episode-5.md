# Episodio 5: Unit Tests + Integration Tests <!-- omit in toc -->

## Contenido <!-- omit in toc -->

- [Introducción](#introducción)
  - [Estructura de un Test](#estructura-de-un-test)
  - [Código de ejemplo de un escenario](#código-de-ejemplo-de-un-escenario)
- [Unit Tests vs Integration Tests](#unit-tests-vs-integration-tests)
- [Paquetes NPM que vamos a utilizar](#paquetes-npm-que-vamos-a-utilizar)
- [Implementación](#implementación)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
- [Lectura recomendadas](#lectura-recomendadas)

## Introducción

En este episodio vamos a implementar dos tipos de pruebas las cuales son muy importantes para asegurar la calidad de un proyecto. El tema de unit testing e integration testing es muy importante de hecho hoy en día muchos proyectos lo tienen como parte del desarrollo y restringen integrar código si las pruebas no tienen la cobertura deseada.

En este ejemplo hemos dejado las pruebas como uno de los últimos pasos, sin embargo, hay prácticas como [TDD](https://es.wikipedia.org/wiki/Desarrollo_guiado_por_pruebas) en las cuales la fase de testing es tan crucial que es una de las primeras etapas antes de implementar cualquier funcionalidad. De hecho el término `Test Driven Development` (TDD) en español debería traducirse como `Desarrollo orientado a Ejemplos`, porque cuando implementas los unit tests antes de implementar el código lo que haces es ir creando una idea de como será tu código.

Resalto que en este workshop no estamos usando el enfoque TDD, no porque no me guste si no para simplificar las explicaciones.

La idea de hacer unit test, es crear unas pruebas de los componentes (clases, funciones) más importantes a nivel de lógica de negocio. En nuestro caso serían los controller, pero en la vida real depende de la estructura que usen en tu proyecto, podrías tener clases o archivos que representen un servicio de dominio, y donde el controller o directamente los routes invoquen a estos servicios, si este fuera el caso entonces nos enfocaríamos en esos componentes.

### Estructura de un Test

Antes de empezar a implementar es muy importante que entiendas algunas cosas base, fíjate en el siguiente código el cual es el tipo esqueleto que puedes encontrar usando algunos framwroks de testing de javascript.

```javascript
//unit under test (component level)
describe('Contacts Controller', () => {
  beforeEach(() => {
    //the code here is executed before each test case
  });

  //unit under test (feature level)
  describe('Get Contact by Index', () => {
    //scenario + expectation
    it('When pass an index of existing contact, should return statusCode 200', async () => {
      //Test Implementation
    });

    //scenario + expectation
    it('When pass an index of contact that does not exist, should return statusCode 404', async () => {
      //Test Implementation
    });
  });

  //unit under test (feature level)
  describe('Create Contact', () => {
    //scenario + expectation
    it('When try to create a contact with correct data, should return statusCode 201', async () => {
      //Test Implementation
    });
  });

  //unit under test (feature level)
  describe('Update Contact', () => {
    //scenario + expectation
    it('When try update a contact with correct data, should return statusCode 200', async () => {
     //Test Implementation
    });

    //scenario + expectation
    it('When try update a contact with correct data but does not exist, should return statusCode 404', async () => {
      //Test Implementation
    });
  });
});
```

El código anterior muestra un ejemplo de como estructurar una prueba siguiendo el patrón [Include 3 parts in each test](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/3-parts-in-name.md). Este enfoque habla de 3 partes: 1) `Unidad que estás probando` y la cual es objetivo de la prueba (componente) y feature. Luego en el `it` o `test` (depende del framework, en jest it es un alias de test así que puedes usar cualquiera de los 2), en los it debes incluir la redacción del 2) `escenario` y la 3) `expectativa` de una manera bien legible y concreta, ejemplo: *When try to create a contact with correct data, should return statusCode 201*.

Dentro de cada `it` o `test` vamos a tener que implementar cada una de las pruebas, un ejemplo para el primer caso sería:

### Código de ejemplo de un escenario

```javascript
//Test Implementation
//Arrange
const contact = {
  index: 1000,
  ...contactMockData,
};
contactModel.findOne = jest.fn().mockResolvedValue(contact);
const ctx = createMockContext({
  method: 'GET',
  customProperties: { params: { index: 1000 } },
});

//Act
await getContactByIndex(ctx);

//Assert
expect(ctx.status).toBe(200);
expect(ctx.body).toBe(contact);
```

En la implementación anterior ves separaciones con los comentarios: `Arrange`, `Act` y `Assert` esto es otra práctica importante que NO debes omitir, de hecho, es un patrón llamado [AAA Pattern](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/aaa.md).

## Unit Tests vs Integration Tests

A diferencia de las pruebas unitarias que buscan probar pequeñas unidades de código de manera aislada, las pruebas de integración se enfocan en una funcionalidad de mas alto nivel probando desde la capa de más alto nivel en la cual se deben consumir otras capas o componentes internos, incluso sin necesidad de crear un mock para componentes externos como librerías, APIs o bases de datos. Aunque en nuestro caso vamos a mockear algunas cosas internas como los modelos de mongoose para evitar depender de la base de datos.

Te muestro dos imágenes que me parece que explican por si mismas la diferencia entre ambos tipos de tests:

`Unit Test`

<img src="images/unit-test-simil.jpg" alt="unit-test" width="500"/>

`Integration Test`

<img src="images/integration-test-simil.jpg" alt="integration-test" width="500"/>

## Paquetes NPM que vamos a utilizar

- [jest](https://jestjs.io/docs/getting-started). Framework de testing, incluye asserts y mocks.
- [@types/jest](https://www.npmjs.com/package/@types/jest). Para contar con intellisense de Jest en VS Code.
- [@shopify/jest-koa-mocks](https://www.npmjs.com/package/@shopify/jest-koa-mocks). Útil crear mock del objeto context de Koa que contiene los datos del request y response http.
- [eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest). Nos ayuda a seguir las mejores prácticas (sintaxis) y anticipar errores comunes al escribir pruebas.
- [supertest](https://www.npmjs.com/package/supertest). Necesario para las pruebas de integración porque nos permite levantar y ejecutar solicitudes http de nuestras routes (en el contexto de cada prueba).

## Implementación

### Unit Tests

1. Instalamos los paquetes npm que usaremos:

```bash
npm i --save-dev jest @types/jest eslint-plugin-jest @shopify/jest-koa-mocks
```

:eight_spoked_asterisk: Nota: estas librerías las instalamos en ambiente de desarrollo, fíjate que muchas veces he usado `npm i -D paquete1` o `npm i --save-dev paquete1`. -D es el shorthand de --save-dev y simplemente significa que estos paquetes se incluirán dentro de la sección devDependencies del package.json y no dentro de dependencias. Cuando vayamos a desplegar podríamos usar el comando npm i --production o npm ci --production para evitar que nuestro desplegable contenga los paquetes de desarrollo.

2. Creamos la carpeta `tests` asegúrate que este en la raíz del proyecto.

3. Dentro de la carpeta tests creamos la carpeta `mock-data`

4. Dentro de `mock-data` creamos el archivo `contact.json`:

```json
{
  "dateOfBirth": "1908-01-01",
  "firstName": "Pepe",
  "lastName": "Trueno",
  "username": "pepetrueno",
  "company": "Acme",
  "email": "pepetrueno@acme.com",
  "phone": "+1 234 456 567",
  "address": {
    "street": "calle ugreen 234",
    "city": "Miami",
    "state": "Florida"
  },
  "jobPosition": "CEO",
  "roles": ["guest", "admin"],
  "active": true
}
```

5. Dentro de `mock-data` creamos el archivo `contacts-invalid-cases.json`:

```json
{
  "contactInvalidEmail": {
    "dateOfBirth": "1908-01-01",
    "firstName": "Pepe",
    "lastName": "Trueno",
    "username": "pepetrueno",
    "company": "Acme",
    "email": "invalid email",
    "phone": "+1 234 456 567",
    "address": {
      "street": "calle ugreen 234",
      "city": "Miami",
      "state": "Florida"
    },
    "jobPosition": "CEO",
    "roles": ["guest", "admin"],
    "active": true
  },
  "contactMissingNames": {
    "dateOfBirth": "1908-01-01",
    "company": "Acme",
    "email": "invalid email",
    "phone": "+1 234 456 567",
    "address": {
      "street": "calle ugreen 234",
      "city": "Miami",
      "state": "Florida"
    },
    "jobPosition": "CEO",
    "roles": ["guest", "admin"],
    "active": true
  },
  "contactInvalidDateOfBirth": {
    "dateOfBirth": "invalid date",
    "company": "Acme",
    "email": "invalid email",
    "phone": "+1 234 456 567",
    "address": {
      "street": "calle ugreen 234",
      "city": "Miami",
      "state": "Florida"
    },
    "jobPosition": "CEO",
    "roles": ["guest", "admin"],
    "active": true
  }
}
```

6. Dentro de `mock-data` creamos el archivo `token.json`:

```json
{
  "validToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjIyNTUxMjEzOTI3ZTE3NTUzZDg1ZjdkIiwidXNlcm5hbWUiOiJqcml2ZXJveCIsImlhdCI6MTY0NzE5OTA4MSwiZXhwIjoxOTAwMDgxNjE2fQ.t_ex_6wBT-AIUHp2HdkrsVDR6FCVfPShHfnpyeEPkSc",
  "wrongToken": "XXXXXXXXXXXXxxxxxxxxxxxxxxxxxxxxxxxx.eyJ1c2VyX2lkIjoiNjIyNTUxMjEzOTI3ZTE3NTUzZDg1ZjdkIiwidXNlcm5hbWUiOiJqcml2ZXJveCIsImlhdCI6MTY0NzE5MDUxMiwiZXhwIjoxNjQ3MTk3NzEyfQ.Govmu2AnSlkjbjOKNHneUYBksWsaEARrYWGnbbQ5Tyk",
  "expiredToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjIyNTUxMjEzOTI3ZTE3NTUzZDg1ZjdkIiwidXNlcm5hbWUiOiJqcml2ZXJveCIsImlhdCI6MTY0NzE5OTA4MSwiZXhwIjoxOTAwMDgxNjE2fQ.t_ex_6wBT-AIUHp2HdkrsVDR6FCVfPShHfnpyeEPkSc"
}
```

7. Dentro de `mock-data` creamos el archivo `user.json`:

```json
{
  "username": "user1",
  "password": "secret"
}
```

:eight_spoked_asterisk: Nota: Todos estos json creados hasta aquí los usaremos en las pruebas, los centralizamos en esta carpeta para evitar duplicar código innecesario.

8. Creamos la carpeta `unit` dentro de la carpeta `tests` aqui agregaremos las pruebas unitarias (unit tests).

9. Ahora creamos el archivo `contacts.controller.spec.js` dentro de `tests/unit`:

```javascript
const { createMockContext } = require('@shopify/jest-koa-mocks');
const {
  getContactByIndex,
  createContact,
  updateContact,
} = require('../../src/controllers/contacts.controller');
const contactModel = require('../../src/models/contact.model');
const contactMockData = require('../mock-data/contact.json');

describe('Contacts Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Contact by Index', () => {
    it('When pass an index of existing contact, should return statusCode 200', async () => {
      //Arrange
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 1000 } },
      });

      //Act
      await getContactByIndex(ctx);

      //Assert
      expect(ctx.status).toBe(200);
      expect(ctx.body).toBe(contact);
    });

    it('When pass an index of contact that does not exist, should return statusCode 404', async () => {
      //Arrange
      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 1000 } },
      });

      try {
        //Act
        await getContactByIndex(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/No se ha encontrado/);
        expect(error.status).toBe(404);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });

  describe('Create Contact', () => {
    it('When try to create a contact with correct data, should return statusCode 201', async () => {
      //Arrange
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      contactModel.create = jest.fn().mockResolvedValue({});
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactMockData,
      });

      //Act
      await createContact(ctx);

      //Assert
      expect(ctx.status).toBe(201);
      expect(ctx.body.index).toBeGreaterThan(contact.index);
    });
  });

  describe('Update Contact', () => {
    it('When try update a contact with correct data, should return statusCode 200', async () => {
      //Arrange
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      contactModel.updateOne = jest.fn().mockResolvedValue({});
      const ctx = createMockContext({
        method: 'PUT',
        customProperties: { params: { index: 1000 } },
        requestBody: contactMockData,
      });

      //Act
      await updateContact(ctx);

      //Assert
      expect(ctx.status).toBe(200);
    });

    it('When try update a contact with correct data but does not exist, should return statusCode 404', async () => {
      //Arrange
      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const ctx = createMockContext({
        method: 'PUT',
        customProperties: { params: { index: 1000 } },
        requestBody: contactMockData,
      });
      try {
        //Act
        await updateContact(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/No se ha encontrado/);
        expect(error.status).toBe(404);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });
});
```

10. Creamos ahora el archivo `auth.controller.spec.js` dentro de `tests/unit` para probar el controlador auth.controller.js:

```javascript
const bcrypt = require('bcrypt');
const { createMockContext } = require('@shopify/jest-koa-mocks');
const { signIn, signUp } = require('../../src/controllers/auth.controller');
const userModel = require('../../src/models/user.model');
const user = require('../mock-data/user.json');

jest.mock('bcrypt');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('When try to register new user with valid data and username that does not exist, should return statusCode 201', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.create = jest.fn().mockResolvedValue({});

      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });
      //Act
      await signUp(ctx);
      //Assert
      expect(ctx.status).toBe(201);
    });

    it('When try to register new user with valid data but the username is already exists, should throw error with statusCode 422', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(user);
      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });

      try {
        //Act
        await signUp(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/ya existe/);
        expect(error.status).toBe(422);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });

  describe('signin', () => {
    it('When try to signin with valid credentials, should return statusCode 200 and a new token', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });
      //Act
      await signIn(ctx);
      //Assert
      expect(ctx.status).toBe(200);
      expect(ctx.body).toHaveProperty('access_token');
      expect(ctx.body).toHaveProperty('token_expires');
    });

    it('When try to signin with wrong username, should return statusCode 401 (Unauthorized)', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);
      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });

      try {
        //Act
        await signIn(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/Usuario o password incorectos/);
        expect(error.status).toBe(401);
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When try to signin with valid username but wrong password, should return statusCode 401 (Unauthorized)', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });

      try {
        //Act
        await signIn(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/Usuario o password incorectos/);
        expect(error.status).toBe(401);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });
});
```

:eight_spoked_asterisk: Nota: Implementamos ahora las pruebas de los dos middleware mas importantes que no se cubren con las pruebas unitarias de los dos pasos anteriores.

11. Creamos el archivo `auth.middleware.spec.js` dentro de `tests/unit`:

```javascript
const { createMockContext } = require('@shopify/jest-koa-mocks');
const { verifyToken } = require('../../src/middleware/auth');
const { validToken, wrongToken, expiredToken } = require('../mock-data/token.json');

describe('Token Verification', () => {
  beforeEach(() => {});

  it('When pass a valid token, should not thrown error', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });
    ctx.headers['x-access-token'] = validToken;

    //Act
    verifyToken(ctx, () => ({}));
    //Assert
    expect(ctx.request.user).not.toBeNull();
  });

  it('When pass an invalid token, should thrown UnauthorizedError', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });
    ctx.headers['x-access-token'] = wrongToken;

    try {
      //Act
      verifyToken(ctx, () => ({}));
    } catch (error) {
      //Arrange
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/Invalid Token/);
      expect(error.isOperational).toBeTruthy();
    }
  });

  it('When pass an expired token, should thrown UnauthorizedError', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });
    ctx.headers['x-access-token'] = expiredToken;

    try {
      //Act
      verifyToken(ctx, () => ({}));
    } catch (error) {
      //Assert
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/Invalid Token/);
      expect(error.isOperational).toBeTruthy();
    }
  });

  it('When do not pass the x-access-token header, should thrown UnauthorizedError', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });

    try {
      //Act
      verifyToken(ctx, () => ({}));
    } catch (error) {
      //Assert
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/A token is required for authentication/);
      expect(error.isOperational).toBeTruthy();
    }
  });
});
```

12. Finalmente implementamos la prueba sobre el schema-validator, creamos el archivo `schema-validator.middleware.spec.js` con el código:

```javascript
const { createMockContext } = require('@shopify/jest-koa-mocks');
const contactMockData = require('../mock-data/contact.json');
const {
  contactInvalidEmail,
  contactMissingNames,
  contactInvalidDateOfBirth,
} = require('../mock-data/contacts-invalid-cases.json');
const validateSchema = require('../../src/middleware/schema-validator');

const { byIndexSchema, postSchema } = require('../../src/schemas/contacts.schema');
const byIndexValidator = validateSchema({ params: byIndexSchema });
const postValidator = validateSchema({ body: postSchema });

describe('Contact Schema Validator', () => {
  describe('Post Schema', () => {
    it('When pass a correct json, should execute next function successfully', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        customProperties: { params: { index: 1000 } },
        requestBody: contactMockData,
      });

      const next = () => {};

      //Act
      const result = postValidator(ctx, () => next);

      //Assert
      expect(typeof result).toBe('function');
    });

    it('When pass an empty body, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: {},
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toMatch(/Solicitud no válida/);
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When pass correct contact in the body but without a valid email, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactInvalidEmail,
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toMatch(/Solicitud no válida/);
        expect(error.message).toMatch(/must be a valid email/);
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When pass correct contact in the body but without a first and last name, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactMissingNames,
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toEqual(
          'Solicitud no válida: Invalid Request Body - "firstName" is required',
        );
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When pass correct contact in the body but with invalid birth day, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactInvalidDateOfBirth,
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toEqual(
          'Solicitud no válida: Invalid Request Body - "dateOfBirth" must be in ISO 8601 date format',
        );
        expect(error.isOperational).toBeTruthy();
      }
    });
  });

  describe('Get By Index Schema', () => {
    it('When pass a number as parameter, should execute next function successfully', () => {
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 1000 } },
      });

      const next = () => {};
      const result = byIndexValidator(ctx, () => next);

      expect(typeof result).toBe('function');
    });

    it('When pass a parameter that not be a number, should thrown InvalidInputError', () => {
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 'xxxxxx' } },
      });

      try {
        byIndexValidator(ctx, () => () => {});
      } catch (error) {
        expect(error.status).toBe(422);
        expect(error.message).toEqual(
          'Solicitud no válida: Invalid URL Parameters - "index" must be a number',
        );
        expect(error.isOperational).toBeTruthy();
      }
    });
  });
});
```

13. Aún nos faltan algunos ajustes, creamos el archivo `jest.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/utils/logging/common-errors.js',
    '/src/utils/logging/error-factory.js',
    '/src/schemas/contacts.schema.js',
  ],
};
```

:eight_spoked_asterisk: Nota: En este archivo podemos establecer muchas opciones como donde estará nuestro reporte de cobertura, elementos a ignorar en la cobertura, plugins como sonaqube. Fíjate que hemos establecido `coveragePathIgnorePatterns` con 3 archivos que no nos interesa hacer pruebas unitarias ya que no tienen implementación importante. Algo importante es que node_modules se ignora por defecto, es decir, si quitas coveragePathIgnorePatterns se ignorará esa carpeta, pero si lo establece explícitamente deberás incluirla.

14. Ahora editamos el archivo `package.json` y asegúrate que esté el siguiente código en los script:

```json
"test": "cross-env NODE_ENV=development jest",
"test:unit": "cross-env NODE_ENV=development jest --verbose ./tests/unit",
"test:coverage": "cross-env NODE_ENV=development jest --coverage",
```

15.  Editemos el archivo `.eslintrc.yml` y agreguemos `jest/global: true` dentro de env y `jest` en la lista de plugins
```yaml
env:
  node: true
  commonjs: true
  es2021: true
  jest/global: true
extends:
  - airbnb-base
  - eslint:recommended
  - prettier
parserOptions:
  ecmaVersion: latest
plugins:
  - prettier
  - jest
rules: {}
```

16. Ejecuta las pruebas con cualquiera de los siguientes scrips:

```bash
npm run test
```

```bash
npm run test:unit
```

:eight_spoked_asterisk: Nota: esta versión lo que hace es ejecutar solo las pruebas (archivos *spec.js* o *test.js*) dentro de la carpeta `tests/unit`

```bash
npm run test:coverage
```

:eight_spoked_asterisk: Nota: esta versión ejecuta todas las pruebas mostrándote la cobertura.

### Integration Tests

Hasta aquí hemos implementado algunas pruebas unitarias. Ahora vamos a implementar unas pruebas con un enfoque mas similar a lo que podría ser un E2E (end to end).

1. Instalamos supertest

```bash
npm i --save-dev supertest
```

2. Creamos el archivo `app.js` dentro de la carpeta `src`. Con este cambio lo que vamos a hacer es re factorizar el código de configuración e inicialización de la variable app que tenemos en el archivo `server.js`, con el fin de poder acceder a esa instancia sin necesidad de ejecutar su método listen. Entonces el código debe quedar así:

```javascript
const Koa = require('koa');
const json = require('koa-json');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const errorHandler = require('./middleware/error-handler');
const LogManager = require('./utils/logging/log-manager');

const logManager = new LogManager();
const routes = require('./routes');

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa();
// Inicializar los middleware
app.use(bodyParser()).use(json()).use(logger()).use(errorHandler);

routes.forEach((item) => {
  app.use(item.routes()).use(item.allowedMethods());
});

module.exports = app;
```

3. Ahora nos falta modificar `server.js` el cual debería quedar así:

```javascript

const yenv = require('yenv');
const mongoose = require('mongoose');
const app = require('./app');

const env = yenv();

app.on('error', (err, ctx) => {
  const isOperationalError = logManager.error(err);
  if (!isOperationalError) {
    process.exit(1);
  }
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

4. Creamos la carpeta `integration` dentro de la carpeta `tests`.

5. Creamos el archivo `contacts.spec.js` dentro de `tests/integration`.

```javascript
const request = require('supertest');
const contactModel = require('../../src/models/contact.model');
const app = require('../../src/app');
const contactMockData = require('../mock-data/contact.json');
const {
  contactInvalidEmail,
  contactMissingNames,
  contactInvalidDateOfBirth,
} = require('../mock-data/contacts-invalid-cases.json');
const { validToken, wrongToken } = require('../mock-data/token.json');

describe('Contacts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    done();
  });

  describe('GET contact by index', () => {
    it('When pass an index of existing contact and valid token, should return the success and statusCode 200', async () => {
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      const agent = request(app.callback());
      const response = await agent
        .get(`/contacts/${contact.index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(contact);
      expect(contactModel.findOne).toBeCalled();
      expect(contactModel.findOne.mock.calls.length).toBe(1);
    });

    it('When pass an index of a contact that does not exist and valid token, should return the statusCode 404', async () => {
      const index = 25000;

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const response = await agent
        .get(`/contacts/${index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
      expect(contactModel.findOne).toHaveBeenCalledWith({ index });
      expect(contactModel.findOne.mock.calls.length).toBe(1);
    });

    it('When pass an invalid index and valid token, should return the statusCode 422', async () => {
      const index = 'xxxxxxx';

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const response = await agent
        .get(`/contacts/${index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({});
    });

    it('When pass a valid index but a invalid token, should return the statusCode 401', async () => {
      const index = 1000;
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      const agent = request(app.callback());

      const response = await agent
        .get(`/contacts/${contact.index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', wrongToken);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
  });

  // ACTUALIZACION DE CONTACTOS
  describe('Update Contact', () => {
    it('When pass correct data of a contact that exists and a valid token, should return statusCode 200', async () => {
      const body = { ...contactMockData };
      const contactFound = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contactFound);
      contactModel.updateOne = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const response = await agent
        .put(`/contacts/${contactFound.index}`)
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(body);
      expect(contactModel.findOne).toHaveBeenCalledWith({ index: contactFound.index });
      expect(contactModel.findOne.mock.calls.length).toBe(1);
      expect(contactModel.updateOne.mock.calls.length).toBe(1);
    });

    it('When try to update of a contact that does not exist and pass a valid token, should return statusCode 404', async () => {
      const body = { ...contactMockData };
      const contactFound = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const response = await agent
        .put(`/contacts/${contactFound.index}`)
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(404);
      expect(contactModel.findOne).toHaveBeenCalledWith({ index: contactFound.index });
      expect(contactModel.findOne.mock.calls.length).toBe(1);
    });

    it('When try to update of a contact with incorrect data and pass a valid token, should return statusCode 422', async () => {
      const index = 1000;

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const invalidBodies = [contactInvalidEmail, contactMissingNames, contactInvalidDateOfBirth];

      for (const invalidBody of invalidBodies) {
        const response = await agent
          .put(`/contacts/${index}`)
          .send(invalidBody)
          .set('Accept', 'application/json')
          .set('x-access-token', validToken);

        expect(response.status).toBe(422);
      }
      expect(contactModel.findOne).not.toHaveBeenCalled();
    });

    it('When try to update but pass wrong token, should return statusCode 401', async () => {
      const body = { ...contactMockData };
      const contactFound = {
        index: 1000,
        ...contactMockData,
      };
      //contactModel.findOne = jest.fn().mockResolvedValue(contactFound);
      //contactModel.updateOne = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const response = await agent
        .put(`/contacts/${contactFound.index}`)
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', wrongToken);

      expect(response.status).toBe(401);
      expect(contactModel.findOne).not.toHaveBeenCalled();
    });
  });

  //CREACION DE CONTACTOS
  describe('Create Contact', () => {
    it('When try to create a contact with correct data and a valid token, should return statusCode 201', async () => {
      const body = { ...contactMockData };
      const lastIndex = 1000;
      contactModel.findOne = jest.fn().mockResolvedValue({ index: lastIndex });
      contactModel.create = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const response = await agent
        .post('/contacts/')
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(201);
      expect(response.body.index).toBeGreaterThan(lastIndex);
      expect(contactModel.create.mock.calls.length).toBe(1);
    });

    it('When try to create new contact with incorrect data and pass a valid token, should return statusCode 422', async () => {
      const index = 1000;

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      contactModel.create = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const invalidBodies = [contactInvalidEmail, contactMissingNames, contactInvalidDateOfBirth];

      for (const invalidBody of invalidBodies) {
        const response = await agent
          .post('/contacts')
          .send(invalidBody)
          .set('Accept', 'application/json')
          .set('x-access-token', validToken);

        expect(response.status).toBe(422);
      }
      expect(contactModel.findOne).not.toHaveBeenCalled();
      expect(contactModel.create).not.toHaveBeenCalled();
    });

    it('When try to create but pass wrong token, should return statusCode 401', async () => {
      const body = { ...contactMockData };

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      contactModel.create = jest.fn().mockResolvedValue({});

      const agent = request(app.callback());

      const response = await agent
        .post('/contacts/')
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', wrongToken);

      expect(response.status).toBe(401);
      expect(contactModel.findOne).not.toHaveBeenCalled();
      expect(contactModel.create).not.toHaveBeenCalled();
    });
  });
});
```

6. Ahora creamos otra prueba creando el archivo `auth.spec.js` igualmente dentro de `tests/integration`.

```javascript
const request = require('supertest');
const bcrypt = require('bcrypt');
const userModel = require('../../src/models/user.model');
const app = require('../../src/app');
const user = require('../mock-data/user.json');

jest.mock('bcrypt');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    done();
  });
  //REGISTRO DE USUARIO
  describe('signup', () => {
    it('When try to register new user with valid data and username that does not exist, should return statusCode 201', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.create = jest.fn().mockResolvedValue({});

      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signup')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(userModel.findOne).toHaveBeenCalled();
      expect(userModel.create).toHaveBeenCalled();
    });

    it('When try to register new user with valid data but the username is already exists, should return statusCode 422', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(user);
      userModel.create = jest.fn().mockResolvedValue({});

      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signup')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(422);
      expect(userModel.findOne).toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });
  });

  //AUTENCICACION Y GENERACION DE TOKEN
  describe('signin', () => {
    it('When try to signin with valid credentials, should return statusCode 200 and a new token', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signin')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_expires');
      expect(response.body.access_token.length).toBeGreaterThan(0);
      expect(response.body.token_expires.length).toBeGreaterThan(0);
      expect(userModel.findOne).toHaveBeenCalled();
    });

    it('When try to signin with wrong username, should return statusCode 401 (Unauthorized)', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      //bcrypt.compare = jest.fn().mockResolvedValue(true);
      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signin')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });

    it('When try to signin with valid username but wrong password, should return statusCode 401 (Unauthorized)', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signin')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });
  });
});
```

7. Editamos el archivo `package.json` para agregar el siguiente script:

```json
 "test:integration": "cross-env NODE_ENV=development jest --verbose ./tests/integration --coverage"
```

8. Ahora ejecutamos las pruebas, tenemos la opción de ejecutar solo las de integración o toda la suite de pruebas:

```bash
npm run test:integration
```

y si queremos ejecutar todo:

```bash
npm run test:coverage
```

## Lectura recomendadas

Te voy a dejar por acá una lista de `Mejores Prácticas` que sugiero leer.

- [Testing And Overall Quality Practices](https://github.com/goldbergyoni/nodebestpractices?#4-testing-and-overall-quality-practices)
- [A guide to unit testing in JavaScript](https://github.com/mawrkus/js-unit-testing-guide)
- [Unit Testing Principles, Practices, and Patterns](https://www.amazon.com/-/es/Vladimir-Khorikov/dp/1617296279/ref=sr_1_2?__mk_es_US=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2PPMYW7D6KTJU&keywords=unit+testing+main&qid=1647628112&sprefix=unit+testing+principles%2Caps%2C153&sr=8-2)