import 'source-map-support/register';

import * as AWS from 'aws-sdk';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { BUCKET, EXPIRES_SEC, PREFIX_UPLOADED, REGION } from '@constants/aws';

export const importProductsFile = async (event) => {
  try {
    const s3 = new AWS.S3({ region: REGION })
    const { name } = event.queryStringParameters;

    if (!name) {
      return formatJSONResponse({
        message: 'Bad request',
      }, 400);
    }

    const url = s3.getSignedUrl('putObject', {
      Bucket: BUCKET,
      Key: `${PREFIX_UPLOADED}/${name}`,
      Expires: EXPIRES_SEC,
      ContentType: 'text/csv',
    });

    return formatJSONResponse(url, 200);
  } catch(error) {
    console.error(error);

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  }
}

export const main = middyfy(importProductsFile);
