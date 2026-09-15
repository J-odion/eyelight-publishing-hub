import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PressAsset } from './schemas/press-asset.schema.js';
import { Post } from './schemas/post.schema.js';

@Injectable()
export class PressService {
  constructor(
    @InjectModel(PressAsset.name) private pressModel: Model<PressAsset>,
    @InjectModel(Post.name) private postModel: Model<Post>
  ) {}

  // === PRESS ASSETS ===
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

  // === PRESS POSTS ===
  async findAllPosts() {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  async findPublishedPosts() {
    return this.postModel.find({ isPublished: true }).sort({ publishedAt: -1, createdAt: -1 }).exec();
  }

  async createPost(data: any) {
    const post = new this.postModel({
      ...data,
      publishedAt: data.isPublished ? new Date() : null,
    });
    return post.save();
  }

  async updatePost(id: string, data: any) {
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = await this.postModel.findByIdAndUpdate(id, data, { new: true });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async removePost(id: string) {
    return this.postModel.findByIdAndDelete(id);
  }
}
