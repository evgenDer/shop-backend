import 'source-map-support/register';

import { Client } from 'pg';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { dbOptions } from '../../dbOptions';

export const getProductById = async (event) => {
  let client;

  try {
    const { productId } = event.pathParameters;

    console.log('Event: ', event, 'Product id: ', productId);

    if (!productId) {
      return formatJSONResponse({
        message: 'Bad request',
      }, 400);
    }

    client = new Client(dbOptions);
    await client.connect();

    const { rows: product } = await client.query(
      'select p.*, s.count from products p left join stocks s on p.id = s.product_id where p.id=$1',
      [productId]
    );

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
    if (client) {
      client.end();
    }
  }
}

export const main = middyfy(getProductById);
