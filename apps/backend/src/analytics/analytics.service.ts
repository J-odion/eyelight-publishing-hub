import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal, DealDocument } from '../deals/schemas/deal.schema.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';
import { Payment, PaymentStatus } from '../payments/schemas/payment.schema.js';
import { Lead, LeadType } from '../leads/schemas/lead.schema.js';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async getDashboardMetrics() {
    // 1. Successful payments revenue
    const successfulPayments = await this.paymentModel.find({ status: PaymentStatus.SUCCESS }).exec();
    const wonPaymentRevenue = successfulPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 2. Won Deals revenue
    const wonDealsValue = await this.dealModel.aggregate([
      { $match: { status: 'won' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalWonRevenue = wonPaymentRevenue + (wonDealsValue[0]?.total || 0);

    // 3. Pipeline value: Pending + Abandoned payments + Open deals
    const pendingPayments = await this.paymentModel.find({
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.ABANDONED] }
    }).exec();
    const pendingPaymentValue = pendingPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const openDealsValue = await this.dealModel.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalPipelineValue = pendingPaymentValue + (openDealsValue[0]?.total || 0);

    // 4. Revenue breakdown by category
    let courseRevenue = 0;
    let consultationRevenue = 0;
    let storeRevenue = 0;
    let publishingRevenue = 0;

    for (const p of successfulPayments) {
      const pPurpose = (p.purpose || '').toLowerCase();
      const pType = (p.metadata?.type || '').toLowerCase();
      if (pType === 'editor-school' || pPurpose.includes('editor') || pPurpose.includes('school')) {
        courseRevenue += p.amount;
      } else if (pType === 'booking' || pPurpose.includes('consultation')) {
        consultationRevenue += p.amount;
      } else if (pType === 'store' || pPurpose.includes('store') || pPurpose.includes('book')) {
        storeRevenue += p.amount;
      } else {
        publishingRevenue += p.amount;
      }
    }

    // 5. Transaction status counts
    const allPayments = await this.paymentModel.find().sort({ createdAt: -1 }).limit(30).exec();
    const paymentCounts = await this.paymentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, sum: { $sum: '$amount' } } }
    ]);

    const countsMap: Record<string, { count: number; sum: number }> = {};
    paymentCounts.forEach(pc => {
      countsMap[pc._id] = { count: pc.count, sum: pc.sum };
    });

    const successfulCount = countsMap[PaymentStatus.SUCCESS]?.count || 0;
    const abandonedCount = countsMap[PaymentStatus.ABANDONED]?.count || 0;
    const failedCount = countsMap[PaymentStatus.FAILED]?.count || 0;
    const pendingCount = countsMap[PaymentStatus.PENDING]?.count || 0;
    const totalTransactions = successfulCount + abandonedCount + failedCount + pendingCount;

    // 6. Course & Consultation stats
    const courseLeads = await this.leadModel.find({ type: LeadType.COURSE_REGISTRATION }).exec();
    const consultationLeads = await this.leadModel.find({ type: LeadType.CONSULTATION }).exec();
    const confirmedBookings = await this.bookingModel.find({ status: BookingStatus.CONFIRMED }).exec();

    // 7. Top Leads and standard CRM data
    const topLeads = await this.contactModel.find()
      .sort({ leadScore: -1 })
      .limit(6)
      .select('firstName lastName email leadScore tags')
      .exec();

    const activityCounts = await this.activityModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const dealsByStage = await this.dealModel.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    const contactsBySource = await this.contactModel.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    return {
      pipelineValue: totalPipelineValue,
      wonRevenue: totalWonRevenue,
      currency: 'NGN',
      revenueBreakdown: {
        course: courseRevenue,
        consultation: consultationRevenue,
        store: storeRevenue,
        publishing: publishingRevenue,
      },
      transactionCounts: {
        successful: successfulCount,
        abandoned: abandonedCount,
        failed: failedCount,
        pending: pendingCount,
        total: totalTransactions,
      },
      courseStats: {
        totalApplicants: courseLeads.length,
        paidStudents: successfulPayments.filter(p => (p.metadata?.type === 'editor-school' || (p.purpose || '').toLowerCase().includes('editor'))).length,
      },
      consultationStats: {
        totalRequests: consultationLeads.length,
        confirmedSessions: confirmedBookings.length,
      },
      recentTransactions: allPayments,
      topLeads,
      activities: activityCounts,
      dealsByStage,
      contactsBySource,
    };
  }
}
