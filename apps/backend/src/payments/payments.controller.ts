import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(AuthGuard('jwt'))
  initializePayment(@Body() body: any) {
    // req.user injected by JWT guard - need to get user from request
    return this.paymentsService.initializeTransaction(
      body.userId,
      body.amount,
      body.email,
      body.purpose,
      body.projectId,
    );
  }

  @Get('verify/:reference')
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyTransaction(reference);
  }
}
