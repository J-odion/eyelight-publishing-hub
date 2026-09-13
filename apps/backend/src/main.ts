import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from the frontend dev server
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  });

  // Seed admin user on startup
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  await app.listen(3000);
  console.log('🚀 Eyelight API running on http://localhost:3000');
}
bootstrap();
