import 'source-map-support/register';

import { Client } from 'pg';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { dbOptions } from '../../dbOptions';

export const getProductsList = async (event) => {
  console.log('Event', event);

  let client;

  try {
    client = new Client(dbOptions);
    await client.connect();

    const { rows: products } = await client.query('select p.*, s.count from products p left join stocks s on p.id = s.product_id');

    return formatJSONResponse(products, 200);
  } catch (error) {
    console.log(error);

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  } finally {
    if (client) {
      client.end();
    }
  }
}

export const main = middyfy(getProductsList);
