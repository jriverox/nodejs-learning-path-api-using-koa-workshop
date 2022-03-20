# Episodio 6: Evaluando el Código usando SonaQube <!-- omit in toc -->

## Contenido <!-- omit in toc -->

- [Introducción](#introducción)
- [Antes de Empezar](#antes-de-empezar)
- [Ejecutar SonarQube desde un contener Docker](#ejecutar-sonarqube-desde-un-contener-docker)
- [Preparar el código del proyecto para que pueda usar SonarQube](#preparar-el-código-del-proyecto-para-que-pueda-usar-sonarqube)
- [Notas adicionales](#notas-adicionales)

## Introducción

En el episodio anterior implementamos y ejecutamos las pruebas y configuramos la cobertura. Ahora en este episodio vamos a configurar [SonarQube](https://docs.sonarqube.org/latest/) la cual nos sirve para evaluar ciertas métricas de calidad de código como:

- Cobertura
- Code Smells
- Vulnerabilidades de seguridad
- Duplicidad.

Los haremos de una manera muy sencilla, ya que la idea es hacer solo una demostración que te pueda ayudar a entender como SonarQube realiza las evaluaciones de esas métricas.

## Antes de Empezar

Asegúrate de tener instalado `Docker` y tener el código construido en el [Episodio 5](episode-5.md).

## Ejecutar SonarQube desde un contener Docker

1. Descarga la imagen de Docker.

```bash
docker pull sonarqube
```

2. Crea el contenedor desde la imagen descargada en el paso anterior. Recuerda que los argumentos `--name my-sonar` indican el nombre con que se va a llamar tu contenedor (puede usar el que gustes).

```bash
docker run -d --name my-sonar -p 9000:9000 -p 9092:9092 sonarqube
```

3. Una vez que el comando anterior se ejecute exitosamente.
4. Intenta abrir la dirección <http://localhost:9000/> desde el navegador (en caso de que no cargue, dale unos segundos para darle chance a que se inicialize sonar).
5. Te va a pedir un usuario y password, usa `admin` para ambos, y sigue los pasos para cambiar la contraseña, recuerda guardarla para que no la pierdas.
6. Aunque tenemos varias opciones para crear el proyecto, seleccionemos la opción `Manually`.
7. Ponle un nombre al proyecto, por ejemplo: `koa-workshop` y deja el mismo valor para Project key y haz clic en Set Up.
8. Ahora para efectos de esta demostración elige la opción `Locally`
9. Necesitamos un token, en `Provide a token` escribe un nombre, por ejemplo `developer1` y le das al botón `Generate`.
10. Copia el token generado, porque lo vamos a necesitar en los pasos siguientes. Se te presentará un paso más pero omítelo.

## Preparar el código del proyecto para que pueda usar SonarQube

1. Instalamos unos paquetes npm que vamos a necesitar:

```bash
npm install -D sonarqube-scanner jest-sonar jest-sonar-reporter
```

2. Crea el archivo `sonar-project.js` en la raíz del proyecto con el siguiente código:

```javascript
const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    token: 'aqui debes colocar tu token',
    options: {
      'sonar.projectName': 'koa-workshop',
      'sonar.sources': 'src',
      'sonar.tests': 'tests',
      'sonar.inclusions': '**', // Entry point of your code
      'sonar.test.inclusions':
        'src/**/*.spec.js,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.testExecutionReportPaths': 'coverage/sonar-report.xml',
    },
  },
  () => {},
);
```

3. Reemplaza el valor del token en este archivo por el token que guardaste.
4. Revisa las configuraciones de las otras propiedades como: `sonar.sources`, `sonar.tests` las cuales deben coincidir con las carpetas del proyecto donde esta el código fuente y las pruebas. Si seguiste el episodio 5 al pie de la letra, solo deberás cambiar el token.
5. Edita el archivo `jest.config.js` para incluir la configuración de las librerías que instalamos en el paso 1, el código completo es:


```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/utils/logging/common-errors.js',
    '/src/utils/logging/error-factory.js',
    '/src/schemas/contacts.schema.js',
  ],
  reporters: [
    'default',
    [
      'jest-sonar',
      {
        outputDirectory: 'coverage',
        outputName: 'sonar-report.xml',
      },
    ],
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  coverageReporters: [`json`, `text`, `html`, `lcov`],
  coverageDirectory: `coverage`,
};
```

6. Ahora busca la carpeta `coverage` y crea un nuevo archivo llamado `sonar-report.xml`, si la carpeta no existe, entonces ejecuta `npm run test:coverage`.
7. Edita el archivo `package.json` para agregar un script (sección scripts) para poder ejecutar Sonar:

```json
 "sonar": "node sonar-project.js"
```

8. Aseguarte que las pruebas se ejecutan satisfactoriamente y que tu Sonar este levantado.
9. Ejecuta:

```bash
npm run sonar
```

10. Si recibes un mensaje de `EXECUTION FAILURE` asegúrate de que hayas copiado el valor del `token` correctamente y que hayas creado el archivo `coverage/sonar-report.xml`
11. Si todo salió bien verás el mensaje `EXECUTION SUCCESS`.
12. Ahora ve al inicio de tu sonar (clic logo sonar) y haz clic en el enlace del proyecto.
13. Desde la pestaña Overall Code, revisa las métricas, si en encuentras algún valor mayor a cero, puedes hacer clic en el número para ver la lista de los bugs, estos bugs son los que deberías arreglar.


## Notas adicionales

Tal como te mencioné al principio de este episodio, esta es una simple demostración, no pretende profundizar en las configuraciones de Sonar ni tampoco en las mejores prácticas de su uso.

Por ejemplo, normalmente en lugar de escanear nuestro código localmente (como lo hemos hecho hasta aquí), podríamos configurar para que se dispare desde un hook de Github. Otra opción sería desde el pipeline de despliegue automático (por ejemplo, con jenkins) que podría generar un Docker con el código, ejecuta las pruebas unitarias. En ese contenedor tendría instalado el [Cliente de Sonar](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/) para usar el CLI y disparar el escaneo.

Espero te haya sido de utilidad, y si lo fue mucho agradecería que le dieras una estrella a este repositorio y también que los compartas con tus colegas.

¡¡Hasta la próxima!!
