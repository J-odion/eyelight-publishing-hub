import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from any frontend (Local, Vercel, etc.)
  app.enableCors({
    origin: true,
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
