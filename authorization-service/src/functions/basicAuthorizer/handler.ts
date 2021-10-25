import 'source-map-support/register';

import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';

import { middyfy } from '@libs/lambda';

export const generatePolicy = (principalId, resource, effect = 'Allow'): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  }
};

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = (event, _ctx, cb) => {
  console.log(`Event: ${JSON.stringify(event)}`);
  
  if (event.type !== 'TOKEN') {
    cb('Unauthorized');
  }

  try {
    const { authorizationToken } = event;
    const encodedCreds = authorizationToken.split(' ')[1];
    const [username, password] = Buffer.from(encodedCreds, 'base64')
      .toString('utf-8')
      .split(':');

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    cb(null, policy);
  } catch(error) {
    cb(`Unauthorized: ${error.message}`)
  }
}

export const main = middyfy(basicAuthorizer);
