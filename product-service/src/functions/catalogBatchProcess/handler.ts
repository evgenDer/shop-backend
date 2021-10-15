import 'source-map-support/register';

import * as AWS from 'aws-sdk';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { REGION } from '@constants/aws';
import { DatabaseService } from '@services/database';

export const catalogBatchProcess = async (event) => {
  const sns = new AWS.SNS({ region: REGION });
  
  let dbService;

  try {
    dbService = new DatabaseService();

    await dbService.connect();

    for (const record of event.Records) {
      const { title, description, price, count } = JSON.parse(record.body);

      await dbService.startTransaction();
  
      const product = await dbService.createProduct(title, description, price, count);
  
      await dbService.commitTransaction();

      await sns.publish({
        Subject: `${product.title} has been created.`,
        Message: JSON.stringify(product),
        TopicArn: process.env.SNS_ARN,
        MessageAttributes: {
          count: {
            DataType: 'Number',
            StringValue: `${product.count}`
          }
        },
      }).promise();
    }

    return formatJSONResponse({ message: 'Accepted' }, 200);
  } catch (error) {
    await dbService.rollbackTransaction();

    console.error(error);

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  } finally {
    dbService?.disconnect();
  }
}

export const main = middyfy(catalogBatchProcess);
