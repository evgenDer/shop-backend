import { DatabaseService } from '@services/database';
import * as AWSMock from 'aws-sdk-mock';

import * as Handler from '../../functions/catalogBatchProcess/handler';

jest.mock('@services/database');

describe('Test catalogBatchProcess', () => {
  const mockProduct = {
    title: 'Book',
    description: 'Book',
    count: 0,
    price: 0,
  };

  const mockCreatedProduct = {
    ...mockProduct,
    id: '778',
  };

  beforeEach(() => {
    // @ts-ignore
    DatabaseService.mockClear();
    jest.clearAllMocks();
  });

  it('should return correct status code', async () => {
    jest.spyOn(DatabaseService.prototype, 'createProduct')
      .mockResolvedValueOnce(mockCreatedProduct);

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify(mockProduct),
        },
      ],
    };

    AWSMock.mock('SNS', 'publish', (_, callback) => {
      callback(undefined, 'success');
    });

    const result = await Handler.catalogBatchProcess(mockEvent);

    expect(result.statusCode).toBe(200);
  });

  it('should called create product correct times', async () => {
    const spyCreateProduct = jest.spyOn(DatabaseService.prototype, 'createProduct')
      .mockResolvedValueOnce(mockCreatedProduct);

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify(mockProduct),
        },
        {
          body: JSON.stringify(mockProduct),
        },
      ],
    };

    AWSMock.mock('SNS', 'publish', (_, callback) => {
      callback(undefined, 'success');
    });

    await Handler.catalogBatchProcess(mockEvent);
    
    expect(spyCreateProduct).toHaveBeenCalledTimes(2);
  });

  it('should return internal error when database error occurred', async () => {
    jest.spyOn(DatabaseService.prototype, 'createProduct')
      .mockRejectedValue('Database error');

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify(mockProduct),
        },
      ],
    };

    AWSMock.mock('SNS', 'publish', (_, callback) => {
      callback(undefined, 'success');
    });

    const result = await Handler.catalogBatchProcess(mockEvent);
    
    expect(result.body).toEqual(JSON.stringify({ message: 'Internal server error' }));
  });
});