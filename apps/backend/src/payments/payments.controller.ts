import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  async initializePayment(@Body() body: any) {
    return this.paymentsService.initializeTransaction({
      email: body.email,
      amount: Number(body.amount),
      purpose: body.purpose,
      userId: body.userId,
      projectId: body.projectId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      metadata: body.metadata,
      callbackUrl: body.callbackUrl,
    });
  }

  @Post('record-attempt')
  async recordPaymentAttempt(@Body() body: any) {
    return this.paymentsService.recordAttempt({
      email: body.email,
      amount: Number(body.amount),
      purpose: body.purpose,
      reference: body.reference,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      metadata: body.metadata,
    });
  }

  @Post('abandon')
  async abandonPayment(@Body() body: { reference: string; reason?: string }) {
    return this.paymentsService.abandonAttempt(body.reference, body.reason);
  }

  @Get('all')
  async getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyTransaction(reference);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
  ) {
    return this.paymentsService.handlePaystackWebhook(
      payload,
      signature,
      req.rawBody,
    );
  }
}
