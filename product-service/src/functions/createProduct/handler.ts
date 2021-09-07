import 'source-map-support/register';

import { Client } from 'pg';

import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { dbOptions } from '../../dbOptions';
import schema from './schema';

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('Event', event, 'Body:', event.body);

  let client;

  try {
    const { title, description, price, count } = event.body;
    
    console.log(title, description, price, count);
    if (!title || !price) {
      return formatJSONResponse({
        message: 'Bad request',
      }, 400);
    }

    client = new Client(dbOptions);
    await client.connect();

    await client.query('BEGIN');

    const { rows: responseProducts } = await client.query(
      'insert into products(title, description, price) values ($1, $2, $3) returning id',
      [title, description, price]
    );

    const { id } = responseProducts[0];

    await client.query(
      'insert into stocks(product_id, count) values ($1, $2)',
      [id, count]
    );

    await client.query('COMMIT');
    return formatJSONResponse({
      id,
      title,
      description,
      price,
    }, 201);
  } catch (error) {
    console.log(error);

    await client.query('ROLLBACK');

    return formatJSONResponse({
      message: 'Internal server error',
    }, 500);
  } finally {
    if (client) {
      client.end();
    }
  }
}

export const main = middyfy(createProduct);
