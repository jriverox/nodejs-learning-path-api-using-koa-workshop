const sonarqubeScanner =  require('sonarqube-scanner'); 
sonarqubeScanner( 
    { 
        serverUrl:  'http://localhost:9000', 
        token : '2b01275e175627f70e62ad9e373add48c1a1fc9a',
        options : { 
            'sonar.projectName': 'koa-workshop',
            'sonar.sources':  'src', 
            'sonar.tests':  'tests', 
            'sonar.inclusions'  :  '**', // Entry point of your code 
            'sonar.test.inclusions':  'src/**/*.spec.js,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx', 
            'sonar.javascript.lcov.reportPaths':  'coverage/lcov.info', 
            'sonar.testExecutionReportPaths':  'coverage/sonar-report.xml' 
        } 
    }, () => {});