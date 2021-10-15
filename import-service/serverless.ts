import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';
import { BUCKET, PRODUCT_SERVICE, REGION } from '@constants/aws';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: `\${cf:${PRODUCT_SERVICE}-\${self:provider.stage}.catalogItemsQueueUrl}`,
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: `arn:aws:s3:::${BUCKET}`,
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: `arn:aws:s3:::${BUCKET}/*`,
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: `\${cf:${PRODUCT_SERVICE}-\${self:provider.stage}.createProductTopicArn}`,
      },
    ],
  },
  functions: { importFileParser, importProductsFile },
};

module.exports = serverlessConfiguration;
