module.exports = {
  name: 'product-service',
  displayName: 'Product service tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/src/libs/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@functions/(.*)$": "<rootDir>/src/functions/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
  },
}