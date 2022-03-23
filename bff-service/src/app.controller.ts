import { All, BadGatewayException, Controller, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All('*')
  async sendRequest(@Req () { originalUrl, method, body }: Request) {
    const recipient = originalUrl.split('/');
    const [, recipientServiceName] = recipient;

    const response = await this.appService.sendRequest(
      recipientServiceName,
      originalUrl,
      method,
      body,
    );

    return response;
  }
}
