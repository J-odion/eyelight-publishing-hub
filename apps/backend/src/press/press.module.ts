import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PressService } from './press.service.js';
import { PressController } from './press.controller.js';
import { PressAsset, PressAssetSchema } from './schemas/press-asset.schema.js';
import { Post, PostSchema } from './schemas/post.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PressAsset.name, schema: PressAssetSchema },
      { name: Post.name, schema: PostSchema }
    ]),
  ],
  controllers: [PressController],
  providers: [PressService],
})
export class PressModule {}
