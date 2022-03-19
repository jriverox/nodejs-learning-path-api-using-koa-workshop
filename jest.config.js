module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/utils/logging/common-errors.js',
    '/src/utils/logging/error-factory.js',
    '/src/schemas/contacts.schema.js'
  ],
  reporters: [
    'default',
    ['jest-sonar', {
      outputDirectory: 'coverage',
      outputName: 'test-reporter.xml'
    }]
  ],
  testResultsProcessor:  "jest-sonar-reporter"
}