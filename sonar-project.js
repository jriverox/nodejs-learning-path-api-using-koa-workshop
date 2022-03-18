const sonarqubeScanner =  require('sonarqube-scanner'); 
sonarqubeScanner( 
    { 
        serverUrl:  'http://localhost:9000', 
        token : '0e685d542f66672cee891b7382ab94719574be0c',
        options : { 
            'sonar.projectName': 'koa-workshop',
            'sonar.sources':  'src', 
            'sonar.tests':  'tests', 
            'sonar.inclusions'  :  '**', // Entry point of your code 
            'sonar.test.inclusions':  'src/**/*.spec.js,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx', 
            'sonar.javascript.lcov.reportPaths':  'coverage/lcov.info', 
            'sonar.testExecutionReportPaths':  'coverage/test-reporter.xml' 
        } 
    }, () => {});