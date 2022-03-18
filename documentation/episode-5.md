# Episodio 5: Unit Tests + Integration Tests

En este episodio vamos a implementar dos tipos de pruebas las cuales son muy importantes para asegurar la calidad de un proyecto. El tema de unit testing e integration testing es muy importante de hecho hoy en día muchos proyectos lo tienen como parte del desarrollo y restringen integrar código si las pruebas no tienen la cobertura deseada.

En este ejemplo hemos realizado las pruebas de último, pero hay prácticas como [TDD](https://es.wikipedia.org/wiki/Desarrollo_guiado_por_pruebas) que se toman tan en serio la fase de testing que inician con la implementación de Unit testing antes de codificar cualquier funcionalidad.

Te voy a dejar por acá una lista de `Mejores Prácticas` que sugiero leer.

[Testing And Overall Quality Practices](https://github.com/goldbergyoni/nodebestpractices?#4-testing-and-overall-quality-practices)

[A guide to unit testing in JavaScript](https://github.com/mawrkus/js-unit-testing-guide)

y Si quieres profundizar con conocimiento que no vas a encontrar en ningún curso, te exhorto a darle un vistazo a este `Libro Super Recomendado`:
[Unit Testing Principles, Practices, and Patterns](https://www.amazon.com/-/es/Vladimir-Khorikov/dp/1617296279/ref=sr_1_2?__mk_es_US=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2PPMYW7D6KTJU&keywords=unit+testing+main&qid=1647628112&sprefix=unit+testing+principles%2Caps%2C153&sr=8-2)

## Paquetes NPM que vamos a utilizar:

[jest](https://jestjs.io/docs/getting-started). Framework de testing, incluye asserts y mocks.
[@types/jest](https://www.npmjs.com/package/@types/jest). Para contar con intellisense de Jest en VS Code.
[@shopify/jest-koa-mocks](https://www.npmjs.com/package/@shopify/jest-koa-mocks). Util crear mock del objeto context de Koa que contiene los datos del request y response http.
[eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest). Nos ayuda a seguir las mejores prácticas (sintaxis) y anticipar errores comunes al escribir pruebas.
[supertest](https://www.npmjs.com/package/supertest). Necesario para las pruebas de integración porque nos permite levantar y ejecutar solicitudes http de nuestras routes (en el contexto de cada prueba).

## Pasos para implementar

### Unit Tests

1. Instalamos los paquetes npm que usaremos:

```bash
npm i --save-dev jest @types/jest eslint-plugin-jest @shopify/jest-koa-mocks
```

:eight_spoked_asterisk: Nota: estas librerias las instalamos en ambiente de desarrollo, fijate que muchas veces he usado `npm i -D paquete1` o `npm i --save-dev paquete1`. -D es el shorthand de --save-dev y simplemente significa que estos paquetes se incluiran dentro de la sección devDependencies del package.json y no dentro de dependencies. Cuando vayamos a desplegar podriamos usar el comando npm i --production o npm ci --production para evitar que nuestro desplegable contenga los paquetes de desarrollo.

2. Creamos la carpeta `tests` asegurate que este en la raíz del proyecto.

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

1. Dentro de `mock-data` creamos el archivo `user.json`:

```json
{
  "username": "user1",
  "password": "secret"
}
```

:eight_spoked_asterisk: Nota: Todos estos json creados hasta aquí los usaremos en las pruebas, los centralizaamos en esta carpeta para evitar duplicar codigo innecesario.

8. Ahora creamos la carpeta `unit` dentro de la carpeta `tests` aqui agregaremos las pruebas unitarias (unit tests).

:eight_spoked_asterisk: Nota: La idea de hacer unit tests es crear unas pruebas de los componentes (clases, funciones) más importantes a nivel de logica de negocio. En nuestro caso serían los controller, pero en la vida real depende de la estructura que usen en tu proyecto, podrias tener clases o archivos que representen un servicio de dominio, y donde el controller o directamente los routes invoquen a estos servicios, si este fuera el caso entonces nos enfocaríamos a estos componentes.

Antes de crear la primera prueba fijate en el siguiente esqueleto:

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
      //code implementation of test
    });

    //scenario + expectation
    it('When pass an index of contact that does not exist, should return statusCode 404', async () => {
      //code implementation of test
    });
  });

  //unit under test (feature level)
  describe('Create Contact', () => {
    //scenario + expectation
    it('When try to create a contact with correct data, should return statusCode 201', async () => {
      //code implementation of test
    });
  });

  //unit under test (feature level)
  describe('Update Contact', () => {
    //scenario + expectation
    it('When try update a contact with correct data, should return statusCode 200', async () => {
      //code implementation of test
    });

    //scenario + expectation
    it('When try update a contact with correct data but does not exist, should return statusCode 404', async () => {
      //code implementation of test
    });
  });
});
```

:eight_spoked_asterisk: Nota: El coódigo anterior muestra un ejemplo de como estructurar una prueba siguiente el patron [Include 3 parts in each test](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/3-parts-in-name.md), los cuale son: Unidad que estas probando y la cual es objetivo de la prueba (componente) y feature. Luego en el `it` o `test`(depende del framework, en jest it es un alias de test asi que puedes usar cualquiera de los 2) debes incluir la redacción del escenario y la expectativa de una manera bien legible y concreta, ejemplo: When try to create a contact with correct data, should return statusCode 201.

Dentro de cada `it` o `test`vamos a tener que implementar cada una de las pruebas, un ejemplo para el primer caso sería:

```javascript
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

:eight_spoked_asterisk: Nota: en el codigo ves 3 separaciones con los comentarios: Arrange, Act y Assert esto es otra práctica importante que no debes omitir, de hecho es un patron llamado [AAA Pattern](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/aaa.md).

9. Continuamos con la implementación, ahora si incluyo todo el còdigo de la prueba. Creamos entonces el archivo `contacts.controller.spec.js` dentro de `tests/unit`:

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

:eight_spoked_asterisk: Nota: Implementamos ahora las pruebas de los dos middleware mas importantes que no se cubren con las pruebas unitarias de los dos pasos anteriores. 11. Creamos el archivo `auth.middleware.spec.js` dentro de `tests/unit`:

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

12. y finalmente implementamos la prueba sobre el schema-validator, ceramos el archivo `schema-validator.middleware.spec.js` con el código:

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

13. Aun nos faltan unos pocos ajustes, creamos el archivo `jest.config.js` en la raíz del proyecto:

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

:eight_spoked_asterisk: Nota: En sste archivo podemos establecer muchas opciones como donde estará nuestro reporte de cobertura, elemntos a ignorar en la cobertura, pugins con sonaqube. Fijate que hemos establecido `coveragePathIgnorePatterns`con 3 archivos que no nos inetersa hacer pruebas unitarias ya que no tienen implementación importante. node_modules se ignora por defecto es decir si quitas coveragePathIgnorePatterns se ignorara esa coarpeta pero si lo establece explicitamente deberás incluirla.

14. Ahora editamos el archivo `package.json` y asegurate que esté el siguiente código en los script:

```json
"test": "cross-env NODE_ENV=development jest",
"test:unit": "cross-env NODE_ENV=development jest --verbose ./tests/unit",
"test:coverage": "cross-env NODE_ENV=development jest --coverage",
```

15. Ejecuta las pruebas con cualquiera de los siguientes scrips:

```bash
npm run test
```

```bash
npm run test:unit
```

:eight_spoked_asterisk: Nota: esta versión lo que hace es ejecutar solo las pruebas (archivos *spec.js o *test.js) dentro de la carpeta `tests/unit`

```bash
npm run test:coverage
```

:eight_spoked_asterisk: Nota: esta versión ejecuta todas las pruebas mostrandote la cobertura.
