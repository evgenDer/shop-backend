import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { DatabaseService } from '@services/database';

export const getProductById = async (event) => {
  let dbService;

  try {
    const { productId } = event.pathParameters;

    console.log('Event: ', event, 'Product id: ', productId);

    if (!productId) {
      return formatJSONResponse({
        message: 'Bad request',
      }, 400);
    }

    dbService = new DatabaseService();
    await dbService.connect();

    const product = await dbService.getProductById(productId);

    if (!product) {
      return formatJSONResponse({
        message: 'Product not found',
      }, 404);
    }

    return formatJSONResponse({
      product,
    }, 200);
  } catch(error) {
    console.error(error);

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  } finally {
    dbService?.disconnect();
  }
}

export const main = middyfy(getProductById);
