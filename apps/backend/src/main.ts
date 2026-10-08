import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // Input Validation & Sanitization
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true 
  }));

  // Restrict CORS (ideally read from env in production, e.g., process.env.FRONTEND_URL)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add production URLs here later
    credentials: true,
  });

  // Seed admin user on startup
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  // Render dynamically assigns process.env.PORT
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Eyelight API running on port ${port}`);
}
bootstrap();
