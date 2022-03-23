import { BadGatewayException, CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Method } from  'axios';
import { CACHE_TTL, MAP_SERVICE_NAMES } from './app.constants';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly productsCacheKey = 'PRODUCTS_CACHE_KEY';

  async sendRequest(
    recipientServiceName: string,
    originalUrl: string,
    method: string,
    body: any,
  ) {
    const recipientUrl = await this.configService.get(MAP_SERVICE_NAMES[recipientServiceName]);

    if (!recipientUrl) {
      throw new BadGatewayException('Cannot process request');
    }

    try {
      const { data } = await this.httpService.axiosRef({
        url: `${recipientUrl}${originalUrl}`,
        method: method as Method,
        ...(Object.keys(body).length > 0 && { data: body }),
      });

      if (method === 'GET' && originalUrl === '/products') {
        const cachedProducts = await this.cacheManager.get(this.productsCacheKey);

        if (cachedProducts) {
          return cachedProducts;
        } else {
          await this.cacheManager.set(this.productsCacheKey, data, { ttl: CACHE_TTL });
        }
      }

      return data;
    } catch ({ response, message }) {
      if (response) {
        const { status, data } = response;

        throw new HttpException(data, status);
      }
      
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
