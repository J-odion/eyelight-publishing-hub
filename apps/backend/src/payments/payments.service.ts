import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Payment, PaymentStatus } from './schemas/payment.schema.js';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema.js';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  purpose?: string;
  userId?: string;
  projectId?: string;
  customerName?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private paystackSecretKey: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private eventEmitter: EventEmitter2,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    if (!this.paystackSecretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY is not defined in environment variables.');
    }
  }

  // Generate an authorization URL using Paystack API
  async initializeTransaction(params: InitializePaymentParams) {
    const {
      email,
      amount,
      purpose = 'Payment to Eyelight Publishing',
      userId,
      projectId,
      customerName,
      customerPhone,
      metadata = {},
      callbackUrl,
    } = params;

    if (!email || !amount || amount <= 0) {
      throw new BadRequestException('A valid email and positive amount are required.');
    }

    const reference = `EYELIGHT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const finalCallbackUrl =
      callbackUrl ||
      this.configService.get<string>('PAYSTACK_CALLBACK_URL') ||
      'https://eyelightpublishers.com/payment/callback';

    // Persist pending payment record in database
    const payment = new this.paymentModel({
      user: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
      project: projectId && Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : undefined,
      amount,
      reference,
      customerEmail: email,
      customerName,
      customerPhone,
      purpose,
      metadata: {
        ...metadata,
        customerName,
        customerPhone,
        userId,
        projectId,
        purpose,
      },
      status: PaymentStatus.PENDING,
    });
    await payment.save();

    // If metadata indicates a booking, also register pending booking record
    if (metadata?.type === 'booking' && metadata?.slotDate) {
      try {
        const slotDate = new Date(metadata.slotDate);
        const slotId = metadata.slotTime || 'standard-slot';
        const expiresAt = new Date(Date.now() + 30 * 60000); // 30 min lock
        await this.bookingModel.create({
          reference,
          slotDate,
          slotId,
          amount,
          customerEmail: email,
          expiresAt,
          status: BookingStatus.PENDING,
        });
      } catch (err: any) {
        this.logger.warn(`Could not mirror pending booking record: ${err?.message}`);
      }
    }

    if (!this.paystackSecretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY not set. Generating mock authorization URL.');
      return {
        authorization_url: `${finalCallbackUrl}?reference=${reference}&mock=true`,
        reference,
      };
    }

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Paystack requires amount in kobo (cents)
          reference,
          callback_url: finalCallbackUrl,
          metadata: {
            userId,
            purpose,
            projectId,
            customerName,
            customerPhone,
            ...metadata,
            custom_fields: [
              { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName || email },
              { display_name: 'Purpose', variable_name: 'purpose', value: purpose },
            ],
          },
        }),
      });

      const data = await response.json();
      if (data.status && data.data?.authorization_url) {
        return {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference,
        };
      }
      this.logger.error(`Paystack initialize failed: ${JSON.stringify(data)}`);
      throw new BadRequestException(data.message || 'Paystack initialization failed.');
    } catch (e: any) {
      this.logger.error('Failed to initialize Paystack transaction', e);
      throw e;
    }
  }

  // Verify the transaction via Paystack API and update payment status
  async verifyTransaction(reference: string) {
    if (!this.paystackSecretKey) {
      // Mock verification for local/offline testing
      const payment = await this.paymentModel.findOneAndUpdate(
        { reference },
        { status: PaymentStatus.SUCCESS, paidAt: new Date() },
        { new: true },
      ).populate('user');

      await this.bookingModel.findOneAndUpdate(
        { reference },
        { status: BookingStatus.CONFIRMED, verifiedAt: new Date() },
      );

      if (payment) {
        this.eventEmitter.emit('payment.completed', {
          email: payment.customerEmail,
          userId: payment.user ? (payment.user as any)._id : undefined,
          data: {
            amount: payment.amount,
            purpose: payment.purpose,
            reference: payment.reference,
            customerName: payment.customerName,
            metadata: payment.metadata,
          },
        });
      }
      return { success: true, payment };
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });

      const data = await response.json();

      if (data.status && data.data.status === 'success') {
        const payment = await this.paymentModel.findOneAndUpdate(
          { reference },
          {
            status: PaymentStatus.SUCCESS,
            paidAt: data.data.paid_at ? new Date(data.data.paid_at) : new Date(),
            channel: data.data.channel,
            paystackData: data.data,
          },
          { new: true },
        ).populate('user');

        // Confirm booking if one exists for this reference
        await this.bookingModel.findOneAndUpdate(
          { reference },
          {
            status: BookingStatus.CONFIRMED,
            verifiedAt: new Date(),
            paystackData: data.data,
          },
        );

        if (payment) {
          this.eventEmitter.emit('payment.completed', {
            email: payment.customerEmail,
            userId: payment.user ? (payment.user as any)._id : undefined,
            data: {
              amount: payment.amount,
              purpose: payment.purpose,
              reference: payment.reference,
              customerName: payment.customerName,
              metadata: payment.metadata,
            },
          });
        }
        return { success: true, payment };
      } else {
        const failureStatus =
          data.data?.status === 'abandoned' ? PaymentStatus.ABANDONED : PaymentStatus.FAILED;

        const payment = await this.paymentModel.findOneAndUpdate(
          { reference },
          { status: failureStatus, paystackData: data.data },
          { new: true },
        );

        await this.bookingModel.findOneAndUpdate(
          { reference },
          { status: BookingStatus.FAILED, paystackData: data.data },
        );

        return {
          success: false,
          status: data.data?.status || 'failed',
          payment,
          message: data.data?.gateway_response || 'Payment not completed.',
        };
      }
    } catch (e: any) {
      this.logger.error(`Failed to verify Paystack transaction ${reference}`, e);
      throw e;
    }
  }

  // Handle Paystack Webhook (HMAC verification and instant status update)
  async handlePaystackWebhook(payload: any, signature: string, rawBodyBuffer?: Buffer) {
    if (!this.paystackSecretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY is missing. Cannot verify webhook signature.');
      return { status: true };
    }

    if (signature) {
      const bodyToHash = rawBodyBuffer || Buffer.from(JSON.stringify(payload));
      const hash = crypto
        .createHmac('sha512', this.paystackSecretKey)
        .update(bodyToHash)
        .digest('hex');

      if (hash !== signature) {
        this.logger.error('Invalid Paystack webhook signature');
        throw new UnauthorizedException('Invalid signature');
      }
    }

    const event = payload?.event;
    const data = payload?.data;

    this.logger.log(`Paystack webhook received: event=${event}, ref=${data?.reference}`);

    if (event === 'charge.success' && data?.reference) {
      const reference = data.reference;

      const payment = await this.paymentModel.findOneAndUpdate(
        { reference },
        {
          status: PaymentStatus.SUCCESS,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
          channel: data.channel,
          paystackData: data,
        },
        { new: true },
      ).populate('user');

      await this.bookingModel.findOneAndUpdate(
        { reference },
        {
          status: BookingStatus.CONFIRMED,
          verifiedAt: new Date(),
          paystackData: data,
        },
      );

      if (payment) {
        this.eventEmitter.emit('payment.completed', {
          email: payment.customerEmail,
          userId: payment.user ? (payment.user as any)._id : undefined,
          data: {
            amount: payment.amount,
            purpose: payment.purpose,
            reference: payment.reference,
            customerName: payment.customerName,
            metadata: payment.metadata,
          },
        });
      }
    }

    return { status: true };
  }
}
