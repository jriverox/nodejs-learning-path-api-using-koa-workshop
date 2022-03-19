const sonarqubeScanner =  require('sonarqube-scanner'); 
sonarqubeScanner( 
    { 
        serverUrl:  'http://localhost:9000', 
        token : '1767150d397352e93e4fffb9d6fe22073f2f9576',
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