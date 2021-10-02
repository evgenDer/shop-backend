import 'source-map-support/register';

import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { DatabaseService } from '@services/database';

import schema from './schema';

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('Event', event);

  let dbService;

  try {
    const { title, description, price, count } = event.body;

    if (!title || price < 0 || count < 0) {
      return formatJSONResponse({
        message: 'Bad request',
      }, 400);
    }

    dbService = new DatabaseService();
    await dbService.connect();

    await dbService.startTransaction();

    const product = await dbService.createProduct(title, description, price, count);

    await dbService.commitTransaction();
    
    return formatJSONResponse(product, 201);
  } catch (error) {
    console.log(error);

    await dbService.rollbackTransaction();;

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  } finally {
    dbService?.disconnect();
  }
}

export const main = middyfy(createProduct);
