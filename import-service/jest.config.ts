module.exports = {
  name: 'import-service',
  displayName: 'Import service tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/src/libs/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@functions/(.*)$": "<rootDir>/src/functions/$1",
  },
}