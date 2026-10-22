import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Payment, PaymentStatus } from './schemas/payment.schema.js';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema.js';
import { Lead } from '../leads/schemas/lead.schema.js';

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
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private eventEmitter: EventEmitter2,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    if (!this.paystackSecretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY is not defined in environment variables.');
    }
  }

  // Pre-log payment attempt so abandoned and failed attempts are 100% captured in CRM
  async recordAttempt(params: {
    email: string;
    amount: number;
    purpose?: string;
    reference?: string;
    customerName?: string;
    customerPhone?: string;
    metadata?: Record<string, any>;
  }) {
    const {
      email,
      amount,
      purpose = 'Payment to Eyelight Publishing',
      customerName = '',
      customerPhone = '',
      metadata = {},
    } = params;

    const reference = params.reference || `EYELIGHT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payment = await this.paymentModel.findOneAndUpdate(
      { reference },
      {
        $set: {
          reference,
          amount,
          customerEmail: email,
          customerName,
          customerPhone,
          purpose,
          metadata,
          status: PaymentStatus.PENDING,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // If it's a 1:1 consultation booking, lock slot without collision errors
    if (metadata?.type === 'booking' && metadata?.slotDate) {
      try {
        const slotDate = new Date(metadata.slotDate);
        const slotId = metadata.slotTime || 'standard-slot';
        const expiresAt = new Date(Date.now() + 30 * 60000);

        const existingBooking = await this.bookingModel.findOne({
          slotDate,
          slotId,
          status: { $in: [BookingStatus.PENDING, BookingStatus.EXPIRED, BookingStatus.FAILED] },
        });

        if (existingBooking) {
          existingBooking.reference = reference;
          existingBooking.amount = amount;
          existingBooking.customerEmail = email;
          existingBooking.status = BookingStatus.PENDING;
          existingBooking.expiresAt = expiresAt;
          await existingBooking.save();
        } else {
          await this.bookingModel.create({
            reference,
            slotDate,
            slotId,
            amount,
            customerEmail: email,
            expiresAt,
            status: BookingStatus.PENDING,
          });
        }
      } catch (err: any) {
        this.logger.warn(`Could not mirror pending booking record: ${err?.message}`);
      }
    }

    // Mirror to Lead so admin immediately sees them in Bookings & Leads
    try {
      const leadType = metadata?.type === 'booking' ? 'Consultation' : 'CourseRegistration';
      await this.leadModel.findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            name: customerName,
            phone: customerPhone,
            type: leadType,
            metadata: {
              ...metadata,
              reference,
              amount,
              purpose,
              status: 'pending_payment',
            },
          },
        },
        { upsert: true, new: true },
      );
    } catch (e: any) {
      this.logger.warn(`Could not update lead on payment attempt: ${e?.message}`);
    }

    return { reference, payment };
  }

  // Mark an attempt as abandoned (e.g. user closed modal) and trigger abandoned email automation
  async abandonAttempt(reference: string, reason?: string) {
    if (!reference) return { success: false };

    const payment = await this.paymentModel.findOne({ reference });
    if (!payment) return { success: false };

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, payment };
    }

    payment.status = PaymentStatus.ABANDONED;
    if (reason) {
      payment.metadata = { ...(payment.metadata || {}), abandonReason: reason };
    }
    await payment.save();

    await this.bookingModel.findOneAndUpdate(
      { reference, status: BookingStatus.PENDING },
      { status: BookingStatus.FAILED },
    );

    if (payment.customerEmail) {
      await this.leadModel.findOneAndUpdate(
        { email: payment.customerEmail },
        { $set: { 'metadata.status': 'abandoned' } },
      );
    }

    const purposeLower = (payment.purpose || '').toLowerCase();
    const isConsult = payment.metadata?.type === 'booking' || purposeLower.includes('consultation');

    this.eventEmitter.emit('payment.abandoned', {
      email: payment.customerEmail,
      data: {
        name: payment.customerName,
        customerName: payment.customerName,
        purpose: payment.purpose,
        amount: payment.amount,
        reference: payment.reference,
        metadata: payment.metadata,
        checkoutUrl: isConsult
          ? 'https://eyelightpublishers.com/book'
          : 'https://eyelightpublishers.com/editor-school#register-form',
      },
    });

    this.logger.log(`Payment attempt marked as ABANDONED: ${reference} (${payment.customerEmail})`);
    return { success: true, payment };
  }

  // Generate an authorization URL using Paystack API (backend redirect mode)
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

    await this.recordAttempt({
      email,
      amount,
      purpose,
      reference,
      customerName,
      customerPhone,
      metadata: {
        ...metadata,
        userId,
        projectId,
      },
    });

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
          amount: Math.round(amount * 100),
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

  // Verify the transaction via Paystack API with automatic upsert and event dispatch
  async verifyTransaction(reference: string) {
    if (!this.paystackSecretKey) {
      // Mock verification for local/offline testing
      const payment = await this.paymentModel.findOneAndUpdate(
        { reference },
        { status: PaymentStatus.SUCCESS, paidAt: new Date() },
        { new: true, upsert: true, setDefaultsOnInsert: true },
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

      if (data.status && data.data?.status === 'success') {
        const paystackData = data.data;
        const amountNgn = (paystackData.amount || 0) / 100;
        const customerEmail = paystackData.customer?.email || '';
        const customerName =
          paystackData.metadata?.customerName ||
          paystackData.metadata?.custom_fields?.find((f: any) => f.variable_name === 'customer_name')?.value ||
          '';
        const customerPhone = paystackData.metadata?.customerPhone || paystackData.customer?.phone || '';
        const purpose =
          paystackData.metadata?.purpose ||
          paystackData.metadata?.custom_fields?.find((f: any) => f.variable_name === 'purpose')?.value ||
          'Payment to Eyelight Publishing';

        const payment = await this.paymentModel.findOneAndUpdate(
          { reference },
          {
            $set: {
              reference,
              amount: amountNgn,
              customerEmail,
              customerName,
              customerPhone,
              purpose,
              status: PaymentStatus.SUCCESS,
              paidAt: paystackData.paid_at ? new Date(paystackData.paid_at) : new Date(),
              channel: paystackData.channel,
              paystackData: paystackData,
              metadata: paystackData.metadata || {},
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        ).populate('user');

        const booking = await this.bookingModel.findOneAndUpdate(
          { reference },
          {
            $set: {
              status: BookingStatus.CONFIRMED,
              verifiedAt: new Date(),
              paystackData: paystackData,
              customerEmail,
              amount: amountNgn,
            },
          },
          { new: true },
        );

        if (customerEmail) {
          await this.leadModel.findOneAndUpdate(
            { email: customerEmail },
            { $set: { 'metadata.status': 'paid', 'metadata.paidAt': new Date() } },
          );
        }

        const slotDate = booking?.slotDate
          ? new Date(booking.slotDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : payment.metadata?.slotDate || '';
        const slotTime = booking?.slotId || payment.metadata?.slotTime || '';

        const eventPayload = {
          email: customerEmail,
          userId: payment.user ? (payment.user as any)._id : undefined,
          data: {
            amount: amountNgn,
            purpose,
            reference,
            customerName,
            name: customerName,
            metadata: payment.metadata,
            slotDate,
            slotTime,
          },
        };

        this.eventEmitter.emit('payment.completed', eventPayload);

        const purposeLower = purpose.toLowerCase();
        const typeLower = (payment.metadata?.type || '').toLowerCase();
        if (typeLower === 'editor-school' || purposeLower.includes('editor') || purposeLower.includes('school')) {
          this.logger.log(`Emitting course.payment_confirmed for ${customerEmail}`);
          this.eventEmitter.emit('course.payment_confirmed', eventPayload);
        } else if (typeLower === 'booking' || purposeLower.includes('consultation')) {
          this.logger.log(`Emitting consultation.booked for ${customerEmail}`);
          this.eventEmitter.emit('consultation.booked', eventPayload);
        }

        return { success: true, payment };
      } else {
        const failureStatus =
          data.data?.status === 'abandoned' ? PaymentStatus.ABANDONED : PaymentStatus.FAILED;

        const paystackData = data.data || {};
        const amountNgn = (paystackData.amount || 0) / 100;
        const customerEmail = paystackData.customer?.email || '';

        const payment = await this.paymentModel.findOneAndUpdate(
          { reference },
          {
            $set: {
              reference,
              amount: amountNgn,
              customerEmail,
              status: failureStatus,
              paystackData: paystackData,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        await this.bookingModel.findOneAndUpdate(
          { reference },
          { status: BookingStatus.FAILED, paystackData: data.data },
        );

        if (customerEmail) {
          this.eventEmitter.emit('payment.abandoned', {
            email: customerEmail,
            data: {
              name: payment.customerName,
              customerName: payment.customerName,
              purpose: payment.purpose,
              amount: payment.amount,
              reference: payment.reference,
              metadata: payment.metadata,
            },
          });
        }

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
      await this.verifyTransaction(data.reference);
    }

    return { status: true };
  }

  // Get all payments for Admin CRM & Dashboard
  async getAllPayments() {
    return this.paymentModel.find().sort({ createdAt: -1 }).limit(100).exec();
  }
}
