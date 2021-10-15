import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import csv from 'csv-parser';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { BUCKET, PREFIX_PARSED, PREFIX_UPLOADED, REGION } from '@constants/aws';

export const importFileParser = async (event) => {
  try {
    const s3 = new AWS.S3({ region: REGION });
    const sqs = new AWS.SQS({ region: REGION });
    
    for (const record of event.Records) {
      const filePath = record.s3.object.key;

      const s3Stream = s3.getObject({
        Bucket: BUCKET,
        Key: filePath,
      }).createReadStream();

      s3Stream
        .pipe(csv())
        .on('data', async (data) => {
          await sqs.sendMessage({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(data),
          }).promise();

          console.log('Send message: ', data);
        })
        .on('error', () => {
          throw new Error('Error occurred during csv parser');
        })
        .on('end', async () => {
          await s3.copyObject({
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${filePath}`,
            Key: filePath.replace(PREFIX_UPLOADED, PREFIX_PARSED),
          }).promise();

          await s3.deleteObject({
            Bucket: BUCKET,
            Key: filePath,
          }).promise();
        });
    }

    return formatJSONResponse({ message: 'Accepted' }, 202);
  } catch(error) {
    console.error(error);

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  }
}

export const main = middyfy(importFileParser);
