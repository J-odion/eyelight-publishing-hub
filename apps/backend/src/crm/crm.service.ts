import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse } from 'csv-parse';
import { Contact, ContactDocument } from './schemas/contact.schema.js';
import { List, ListDocument } from './schemas/list.schema.js';
import * as fs from 'fs';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(List.name) private listModel: Model<ListDocument>,
  ) {}

  // List Management
  async getLists() {
    return this.listModel.find().exec();
  }

  async createList(name: string, type: string, query?: any) {
    const list = new this.listModel({ name, type, query });
    return list.save();
  }

  // Contact Management
  async getContacts(tag?: string, listId?: string, search?: string, limit = 50, skip = 0) {
    const filter: any = {};
    if (tag) filter.tags = tag;
    if (listId) filter.listIds = listId;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.contactModel.find(filter).limit(limit).skip(skip).exec(),
      this.contactModel.countDocuments(filter)
    ]);
    return { data, total, limit, skip };
  }

  async getTags() {
    // Return unique tags used across contacts
    return this.contactModel.distinct('tags');
  }

  // CSV Import
  async importContacts(filePath: string, tag: string) {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      let added = 0;
      let updated = 0;
      let skipped = 0;

      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              // Map standard headers (email, firstName, name, etc.)
              const email = (row.email || row.Email || row.EMAIL || '').toLowerCase();
              if (!email) {
                skipped++;
                continue;
              }

              const firstName = row.firstName || row.first_name || row.Name?.split(' ')[0] || '';
              const lastName = row.lastName || row.last_name || row.Name?.split(' ').slice(1).join(' ') || '';

              const existing = await this.contactModel.findOne({ email });

              if (existing) {
                // Update
                if (tag && !existing.tags.includes(tag)) {
                  existing.tags.push(tag);
                }
                existing.source = 'import';
                await existing.save();
                updated++;
              } else {
                // Insert
                await this.contactModel.create({
                  email,
                  firstName,
                  lastName,
                  tags: tag ? [tag] : [],
                  source: 'import',
                  status: 'subscribed'
                });
                added++;
              }
            }
            // Clean up file
            fs.unlinkSync(filePath);
            resolve({ added, updated, skipped });
          } catch (error) {
            this.logger.error('Error processing CSV rows', error);
            reject(error);
          }
        })
        .on('error', (error) => reject(error));
    });
  }
}
