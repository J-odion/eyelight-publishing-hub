import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User, UserSchema } from './schemas/user.schema.js';
import { Manuscript, ManuscriptSchema } from './schemas/manuscript.schema.js';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Manuscript.name, schema: ManuscriptSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
