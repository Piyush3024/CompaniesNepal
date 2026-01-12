import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello() {
    const NODE_ENV: string =
      this.configService.get('NODE_ENV') || 'development';
    const APP_VERSION: string =
      this.configService.get('APP_VERSION') || '1.0.0';

    return {
      status: 'success',
      message: 'Companies Nepal Management System API is running',
      environment: NODE_ENV,
      version: APP_VERSION,
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        auth: '/auth',
        users: '/users',
        companies: '/companies',
        products: '/products',
        categories: '/categories',
        inquiries: '/inquiries',
        reviews: '/reviews',
        location: '/location',
      },
    };
  }

  @Get('api/health')
  async getHealth() {
    return this.appService.healthCheck();
  }
}
