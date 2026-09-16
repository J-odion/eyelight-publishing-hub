import { Injectable, NotFoundException } from '@nestjs/common';
import juice from 'juice';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Automation, AutomationDocument, AutomationEvent } from './schemas/automation.schema.js';

@Injectable()
export class AutomationsService {
  constructor(
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
  ) {}

  async findAll() {
    return this.automationModel.find().exec();
  }

  async findOneByEvent(triggerEvent: string) {
    return this.automationModel.findOne({ triggerEvent: triggerEvent as AutomationEvent }).exec();
  }

  async upsertAutomation(triggerEvent: string, data: Partial<Automation>) {
    if (data.content) {
      data.content = juice(data.content);
    }
    return this.automationModel.findOneAndUpdate(
      { triggerEvent: triggerEvent as AutomationEvent },
      { $set: data },
      { new: true, upsert: true }
    ).exec();
  }

  async remove(id: string) {
    const automation = await this.automationModel.findByIdAndDelete(id);
    if (!automation) throw new NotFoundException('Automation not found');
    return automation;
  }
}
