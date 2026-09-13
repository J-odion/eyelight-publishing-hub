import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus } from './schemas/payment.schema.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private paystackSecretKey: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  // Generate an authorization URL using Paystack API
  async initializeTransaction(userId: string, amount: number, email: string, purpose: string, projectId?: string) {
    const reference = \`EYELIGHT-\${Date.now()}-\${Math.floor(Math.random() * 1000)}\`;

    const payment = new this.paymentModel({
      user: userId,
      project: projectId,
      amount,
      reference,
      purpose
    });
    await payment.save();

    if (!this.paystackSecretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY not set. Mocking initialization.');
      return { authorization_url: \`https://checkout.paystack.com/mock/\${reference}\`, reference };
    }

    try {
      // Typically we'd use axios to POST to https://api.paystack.co/transaction/initialize
      // Mocking fetch call for architectural setup
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${this.paystackSecretKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack expects kobo
          reference,
          metadata: { userId, purpose, projectId }
        })
      });

      const data = await response.json();
      if (data.status) {
        return { authorization_url: data.data.authorization_url, reference };
      }
      throw new Error(data.message);
    } catch (e) {
      this.logger.error('Failed to initialize Paystack transaction', e);
      throw e;
    }
  }

  // Verify the transaction via webhook or manual check
  async verifyTransaction(reference: string) {
    if (!this.paystackSecretKey) {
      // Mock verification for local dev without key
      const payment = await this.paymentModel.findOneAndUpdate(
        { reference },
        { status: PaymentStatus.SUCCESS },
        { new: true }
      );
      return payment;
    }

    try {
      const response = await fetch(\`https://api.paystack.co/transaction/verify/\${reference}\`, {
        headers: {
          Authorization: \`Bearer \${this.paystackSecretKey}\`,
        },
      });

      const data = await response.json();
      if (data.status && data.data.status === 'success') {
        const payment = await this.paymentModel.findOneAndUpdate(
          { reference },
          { status: PaymentStatus.SUCCESS },
          { new: true }
        );
        return payment;
      } else {
        await this.paymentModel.findOneAndUpdate(
          { reference },
          { status: PaymentStatus.FAILED }
        );
      }
    } catch (e) {
      this.logger.error('Failed to verify Paystack transaction', e);
      throw e;
    }
  }
}
