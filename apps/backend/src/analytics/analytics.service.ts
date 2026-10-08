import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal, DealDocument } from '../deals/schemas/deal.schema.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async getDashboardMetrics() {
    const totalDealsValue = await this.dealModel.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    const wonDealsValue = await this.dealModel.aggregate([
      { $match: { status: 'won' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    const topLeads = await this.contactModel.find()
      .sort({ leadScore: -1 })
      .limit(5)
      .select('firstName lastName email leadScore')
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
      pipelineValue: totalDealsValue[0]?.total || 0,
      wonRevenue: wonDealsValue[0]?.total || 0,
      topLeads,
      activities: activityCounts,
      dealsByStage,
      contactsBySource
    };
  }
}
