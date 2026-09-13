import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema.js';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async findAll() {
    return this.bookModel.find({ isPublished: true }).sort({ publicationDate: -1 }).exec();
  }

  async findOne(id: string) {
    const book = await this.bookModel.findById(id);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(data: any) {
    const book = new this.bookModel(data);
    return book.save();
  }

  async update(id: string, data: any) {
    const book = await this.bookModel.findByIdAndUpdate(id, data, { new: true });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async remove(id: string) {
    return this.bookModel.findByIdAndDelete(id);
  }
}
