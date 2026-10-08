import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema.js';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async createActivity(data: any) {
    return this.activityModel.create(data);
  }

  async getActivities(contactId?: string, dealId?: string, ownerId?: string) {
    const filter: any = {};
    if (contactId) filter.contactId = contactId;
    if (dealId) filter.dealId = dealId;
    if (ownerId) filter.ownerId = ownerId;

    return this.activityModel.find(filter)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateActivity(id: string, data: any) {
    const activity = await this.activityModel.findByIdAndUpdate(id, data, { new: true });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async deleteActivity(id: string) {
    const activity = await this.activityModel.findByIdAndDelete(id);
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }
}
