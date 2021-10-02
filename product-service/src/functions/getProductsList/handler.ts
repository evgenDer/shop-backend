import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { DatabaseService } from '@services/database';

export const getProductsList = async (event) => {
  console.log('Event', event);
  
  let dbService;

  try {
    dbService = new DatabaseService();
    await dbService.connect();

    const products = await dbService.getProductList();

    return formatJSONResponse(products, 200);
  } catch (error) {
    console.log(error);

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  } finally {
    dbService?.disconnect();
  }
}

export const main = middyfy(getProductsList);
