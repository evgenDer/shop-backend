import * as AWSMock from 'aws-sdk-mock';

import { importProductsFile } from '../../functions/importProductsFile/handler';

describe('Test importProductsFile', () => {
  test('should return 400 and correct message when name is not passed', async () => {
    const event = { 
      queryStringParameters: {
        name: '',
      },
    };

    const result = await importProductsFile(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: 'Bad request' }));
  });

  test('should return correct status code', async () => {
    const event = { 
      queryStringParameters: {
        name: 'File',
      },
    };

    const mockSignedUrl = 'url';
    AWSMock.mock('S3', 'getSignedUrl', mockSignedUrl);

    const result = await importProductsFile(event);

    expect(result.statusCode).toEqual(200);
  });
});
