import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { LeadsModule } from './leads/leads.module.js';
import { EmailModule } from './email/email.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { BooksModule } from './books/books.module.js';
import { EventsModule } from './events/events.module.js';
import { ReferralsModule } from './referrals/referrals.module.js';
import { PressModule } from './press/press.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    LeadsModule,
    EmailModule,
    PaymentsModule,
    BooksModule,
    EventsModule,
    ReferralsModule,
    PressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
