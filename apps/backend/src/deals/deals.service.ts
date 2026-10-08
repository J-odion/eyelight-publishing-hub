import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal, DealDocument } from './schemas/deal.schema.js';
import { Pipeline, PipelineDocument } from './schemas/pipeline.schema.js';

@Injectable()
export class DealsService {
  constructor(
    @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
    @InjectModel(Pipeline.name) private pipelineModel: Model<PipelineDocument>,
  ) {}

  // --- Pipelines ---
  async createPipeline(data: any) {
    return this.pipelineModel.create(data);
  }

  async getPipelines() {
    return this.pipelineModel.find().exec();
  }

  async updatePipeline(id: string, data: any) {
    const pipeline = await this.pipelineModel.findByIdAndUpdate(id, data, { new: true });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  // --- Deals ---
  async createDeal(data: any) {
    return this.dealModel.create(data);
  }

  async getDeals(pipelineId?: string, ownerId?: string, contactId?: string) {
    const filter: any = {};
    if (pipelineId) filter.pipelineId = pipelineId;
    if (ownerId) filter.ownerId = ownerId;
    if (contactId) filter.contactId = contactId;
    
    return this.dealModel.find(filter)
      .populate('contactId', 'firstName lastName email')
      .populate('ownerId', 'name email')
      .exec();
  }

  async updateDeal(id: string, data: any) {
    const deal = await this.dealModel.findByIdAndUpdate(id, data, { new: true });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async updateDealStage(id: string, stage: string) {
    let status = 'open';
    if (stage.toLowerCase() === 'won') status = 'won';
    if (stage.toLowerCase() === 'lost') status = 'lost';
    
    const deal = await this.dealModel.findByIdAndUpdate(id, { stage, status }, { new: true });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }
}
