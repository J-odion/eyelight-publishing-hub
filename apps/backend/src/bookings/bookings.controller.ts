import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async createBooking(
    @Body('slotId') slotId: string,
    @Body('slotDate') slotDate: string,
    @Body('amount') amount: number,
    @Body('customerEmail') customerEmail: string,
  ) {
    return this.bookingsService.createBooking(
      slotId,
      new Date(slotDate),
      amount,
      customerEmail,
    );
  }

  @Get(':reference')
  async getBookingStatus(@Param('reference') reference: string) {
    return this.bookingsService.getBookingStatus(reference);
  }

  @Post(':reference/verify')
  async verifyTransaction(@Param('reference') reference: string) {
    return this.bookingsService.verifyTransaction(reference);
  }
}
