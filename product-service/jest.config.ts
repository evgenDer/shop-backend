module.exports = {
  name: 'product-service',
  displayName: 'Product service tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/src/libs/$1"
  },
}