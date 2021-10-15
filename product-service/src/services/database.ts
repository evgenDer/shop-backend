import { Client } from 'pg';

import { Product } from '../types/product';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

export class DatabaseService {
  private static readonly dpOptions = {
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  };

  private client: Client;

  constructor() {
    this.client = new Client(DatabaseService.dpOptions);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async startTransaction(): Promise<void> {
    await this.client.query('BEGIN');
  }

  async commitTransaction(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollbackTransaction(): Promise<void> {
    await this.client.query('ROLLBACK');
  }
  
  async createProduct(title: string, description: string, price: number, count: number): Promise<Product> {
    const { rows } = await this.client.query(
      'insert into products(title, description, price) values ($1, $2, $3) returning id',
      [title, description, price]
    );

    const { id } = rows[0];

    await this.client.query(
      'insert into stocks(product_id, count) values ($1, $2)',
      [id, count]
    );

    return {
      id,
      title,
      description,
      price,
      count,
    };
  }

  async getProductList(): Promise<Product[]> {
    const { rows } = await this.client.query(
      'select p.*, s.count from products p left join stocks s on p.id = s.product_id'
    );

    return rows;
  }

  async getProductById(productId: string): Promise<Product> {
    const { rows } = await this.client.query(
      'select p.*, s.count from products p left join stocks s on p.id = s.product_id where p.id=$1',
      [productId]
    );

    return rows[0];
  }
}