import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReferralsService } from './referrals.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';
import { ReferralStatus } from './schemas/referral.schema.js';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // Author: Get my referral code + stats
  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  getMyReferralInfo(@Req() req: any) {
    return this.referralsService.getMyReferralInfo(req.user._id);
  }

  // Public: Track a referral when someone signs up via ref code
  @Post('track')
  trackReferral(@Body() body: { referralCode: string; referredEmail: string; referredUserId: string }) {
    return this.referralsService.trackReferral(body.referralCode, body.referredEmail, body.referredUserId);
  }

  // Admin: View all referrals
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.referralsService.findAll();
  }

  // Admin: Update referral status (mark as completed/credited)
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: { status: ReferralStatus; creditAmount?: number }) {
    return this.referralsService.updateStatus(id, body.status, body.creditAmount);
  }
}
