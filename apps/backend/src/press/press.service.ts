import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PressAsset } from './schemas/press-asset.schema.js';

@Injectable()
export class PressService {
  constructor(@InjectModel(PressAsset.name) private pressModel: Model<PressAsset>) {}

  async findAll() {
    return this.pressModel.find({ isPublished: true }).sort({ createdAt: -1 }).exec();
  }

  async findByType(type: string) {
    return this.pressModel.find({ isPublished: true, type: type as any }).sort({ createdAt: -1 }).exec();
  }

  async create(data: any) {
    const asset = new this.pressModel(data);
    return asset.save();
  }

  async update(id: string, data: any) {
    const asset = await this.pressModel.findByIdAndUpdate(id, data, { new: true });
    if (!asset) throw new NotFoundException('Press asset not found');
    return asset;
  }

  async remove(id: string) {
    return this.pressModel.findByIdAndDelete(id);
  }
}
