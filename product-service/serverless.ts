import type { AWS } from '@serverless/typescript';

import catalogBatchProcess from '@functions/catalogBatchProcess';
import createProduct from '@functions/createProduct';
import getProductById from '@functions/getProductById';
import getProductsList from '@functions/getProductsList';
import { MAX_SIZE_SMALL_CONSIGNMENT } from '@constants/filter';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PRODUCT_QUEUE: 'product-queue',
      PRODUCT_NOTIFICATION: 'product-notification',
      PG_HOST: '${env:PG_HOST}',
      PG_PORT: '${env:PG_PORT}',
      PG_DATABASE: '${env:PG_DATABASE}',
      PG_USERNAME: '${env:PG_USERNAME}',
      PG_PASSWORD: '${env:PG_PASSWORD}',
      SNS_ARN: {
        Ref: 'createProductTopic',
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'createProductTopic',
        },
      }
    ],
    lambdaHashingVersion: '20201221',
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.environment.PRODUCT_QUEUE}',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: '${self:provider.environment.PRODUCT_NOTIFICATION}',
        },
      },
      createProductTopicSubLargeConsignment: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '${env:EMAIL_LARGE_CONSIGNMENT}',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic',
          },
          FilterPolicy: {
            count: [{'numeric': ['>', MAX_SIZE_SMALL_CONSIGNMENT ]}]
          },
        },
      },
      createProductTopicSubSmallConsignment: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '${env:EMAIL_SMALL_CONSIGNMENT}',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic',
          },
          FilterPolicy: {
            count: [{'numeric': ['<=', MAX_SIZE_SMALL_CONSIGNMENT ]}]
          },
        }
      },
    },
    Outputs: {
      catalogItemsQueueUrl: {
        Value: {
          Ref: 'catalogItemsQueue',
        },
      },
      createProductTopicArn: {
        Value: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      }
    },
  },
  functions: { 
    catalogBatchProcess,
    createProduct, 
    getProductById, 
    getProductsList, 
  },
};

module.exports = serverlessConfiguration;
