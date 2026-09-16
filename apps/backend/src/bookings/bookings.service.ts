import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema.js';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private paystackSecretKey: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
  }

  async createBooking(slotId: string, slotDate: Date, amount: number, customerEmail: string) {
    const reference = `EYELIGHT-BOOKING-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const lockedAt = new Date();
    const expiresAt = new Date(lockedAt.getTime() + 30 * 60000); // 30 minutes from now

    try {
      const booking = new this.bookingModel({
        reference,
        slotId,
        slotDate,
        amount,
        customerEmail,
        lockedAt,
        expiresAt,
        status: BookingStatus.PENDING
      });
      await booking.save();

      // Call Paystack to initialize transaction
      let authorization_url = `https://checkout.paystack.com/mock/${reference}`;
      
      if (this.paystackSecretKey) {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customerEmail,
            amount: amount * 100, // Paystack expects kobo/cents
            reference,
            metadata: { slotId, slotDate }
          })
        });

        const data = await response.json();
        if (data.status) {
          authorization_url = data.data.authorization_url;
        } else {
          this.logger.error(`Paystack initialization failed: ${data.message}`);
          // If Paystack fails, we could revert the booking, but we'll let it expire normally
        }
      }

      return { reference, authorization_url };

    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Slot is no longer available');
      }
      throw error;
    }
  }

  async getBookingStatus(reference: string) {
    const booking = await this.bookingModel.findOne({ reference });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return { status: booking.status };
  }

  async verifyTransaction(reference: string) {
    const booking = await this.bookingModel.findOne({ reference });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Idempotent: If it's already confirmed, return immediately
    if (booking.status === BookingStatus.CONFIRMED) {
      return booking;
    }

    if (!this.paystackSecretKey) {
       // Mock verification logic
       booking.status = BookingStatus.CONFIRMED;
       booking.verifiedAt = new Date();
       await booking.save();
       return booking;
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });

      const data = await response.json();
      
      if (data.status) {
        if (data.data.status === 'success') {
          // Additional check: currency/amount matches could be added here
          booking.status = BookingStatus.CONFIRMED;
          booking.verifiedAt = new Date();
          booking.paystackData = data.data;
        } else if (data.data.status === 'failed' || data.data.status === 'abandoned') {
          booking.status = BookingStatus.FAILED;
          booking.paystackData = data.data;
        }
        // If Paystack reports 'pending', we do not change our status
      }
      
      await booking.save();
      return booking;
    } catch (error) {
      this.logger.error(`Failed to verify transaction ${reference}`, error);
      throw error;
    }
  }

  @Cron('0 */2 * * * *')
  async handleExpiredBookings() {
    this.logger.log('Checking for expired pending bookings...');
    const now = new Date();
    
    const pendingExpiredBookings = await this.bookingModel.find({
      status: BookingStatus.PENDING,
      expiresAt: { $lt: now }
    });

    for (const booking of pendingExpiredBookings) {
      this.logger.log(`Verifying expired booking: ${booking.reference}`);
      try {
        await this.verifyTransaction(booking.reference);
        
        // Fetch it again to see if verifyTransaction changed it
        const updatedBooking = await this.bookingModel.findById(booking._id);
        
        if (updatedBooking && updatedBooking.status === BookingStatus.PENDING) {
           // Still not successful -> mark as expired and release slot
           updatedBooking.status = BookingStatus.EXPIRED;
           await updatedBooking.save();
           this.logger.log(`Booking ${booking.reference} marked as EXPIRED.`);
        }
      } catch (error) {
        this.logger.error(`Failed to process expired booking ${booking.reference}`, error);
      }
    }
  }
}
