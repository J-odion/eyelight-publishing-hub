import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsService } from './referrals.service.js';
import { ReferralsController } from './referrals.controller.js';
import { Referral, ReferralSchema } from './schemas/referral.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
