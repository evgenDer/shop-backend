import * as Handler from '../../functions/getProductById/handler';

describe('Test getProductById', () => {
  test('should return 404 status code when product was not found', async () => {
    const event = { pathParameters: '' };
    const result = await Handler.getProductById(event);

    expect(result.statusCode).toBe(404);
    expect(result.body).toEqual(JSON.stringify({ message: 'Product not found' }));
  });

  test('should return right object code when product was found', async () => {
    const event = { 
      pathParameters: {
        productId: '9781593275846',
      },
    };

    const foundObject = {
      id: '9781593275846',
      title: 'Eloquent JavaScript, Second Edition',
      price: 15,
      count: 3,
      description: 'JavaScript lies at the heart of almost every modern web application, from social apps to the newest browser-based games. Though simple for beginners to pick up and play with, JavaScript is a flexible, complex language that you can use to build full-scale applications.',
    };

    const result = await Handler.getProductById(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({ product: foundObject }));
  });
});