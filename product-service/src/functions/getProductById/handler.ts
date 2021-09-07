import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { getItemById } from '@libs/utils';

import products from '../../../products.json';

export const getProductById = async (event) => {
  const { productId } = event.pathParameters;

  const product = await getItemById(products, productId);

  if (!product) {
    return formatJSONResponse({
      message: 'Product not found',
    }, 404);
  }

  return formatJSONResponse({
    product,
  }, 200);
}

export const main = middyfy(getProductById);
