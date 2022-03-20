const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    token: 'cb5f2910d67e32f1eb559fe86e6f6300db9b0bc7',
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