import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { parse } from 'csv-parse';
import { Contact, ContactDocument } from './schemas/contact.schema.js';
import { List, ListDocument } from './schemas/list.schema.js';
import { ResendContactsService } from '../mail/resend.contacts.service.js';
import * as fs from 'fs';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    private readonly resendContacts: ResendContactsService,
  ) {}

  // ─── List Management ───────────────────────────────────────────────────────

  async getLists() {
    return this.listModel.find().exec();
  }

  async createList(name: string, type: string, query?: any) {
    const list = new this.listModel({ name, type, query });
    return list.save();
  }

  async deleteList(id: string) {
    const list = await this.listModel.findByIdAndDelete(id);
    if (!list) throw new NotFoundException('List not found');
    return list;
  }

  // ─── Contact Management ────────────────────────────────────────────────────

  async getContacts(tag?: string, listId?: string, search?: string, limit = 50, skip = 0) {
    const filter: any = {};
    if (tag) filter.tags = tag;
    if (listId) filter.listIds = new Types.ObjectId(listId);
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
    return this.contactModel.distinct('tags');
  }

  async createContact(data: any) {
    const existing = await this.contactModel.findOne({ email: data.email?.toLowerCase() });
    if (existing) {
      // Merge tags if provided
      if (data.tags && data.tags.length > 0) {
        const merged = [...new Set([...existing.tags, ...data.tags])];
        existing.tags = merged;
        await existing.save();
      }
      // Sync update to Resend
      await this.resendContacts.updateContact(existing.email, {
        firstName: existing.firstName,
        lastName: existing.lastName,
        unsubscribed: existing.status !== 'subscribed',
      });
      return existing;
    }
    
    const created = await this.contactModel.create({
      ...data,
      email: data.email?.toLowerCase(),
      status: data.status || 'subscribed',
      source: data.source || 'manual',
    });

    // Sync new contact to Resend
    await this.resendContacts.syncContact({
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
      unsubscribed: created.status !== 'subscribed',
    });

    return created;
  }

  async updateContact(id: string, data: any) {
    const contact = await this.contactModel.findByIdAndUpdate(id, data, { new: true });
    if (!contact) throw new NotFoundException('Contact not found');
    
    // Sync update to Resend
    await this.resendContacts.updateContact(contact.email, {
      firstName: contact.firstName,
      lastName: contact.lastName,
      unsubscribed: contact.status !== 'subscribed',
    });

    return contact;
  }

  async addContactToList(contactId: string, listId: string) {
    const contact = await this.contactModel.findById(contactId);
    if (!contact) throw new NotFoundException('Contact not found');
    const listObjectId = new Types.ObjectId(listId);
    if (!contact.listIds.some(id => id.toString() === listObjectId.toString())) {
      contact.listIds.push(listObjectId);
      await contact.save();
    }
    return contact;
  }

  // ─── CSV Import ───────────────────────────────────────────────────────────

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
              const email = (row.email || row.Email || row.EMAIL || '').toLowerCase();
              if (!email) {
                skipped++;
                continue;
              }

              const firstName = row.firstName || row.first_name || row.Name?.split(' ')[0] || '';
              const lastName = row.lastName || row.last_name || row.Name?.split(' ').slice(1).join(' ') || '';

              const existing = await this.contactModel.findOne({ email });

              if (existing) {
                if (tag && !existing.tags.includes(tag)) {
                  existing.tags.push(tag);
                }
                existing.source = 'import';
                await existing.save();
                // Sync update
                await this.resendContacts.updateContact(existing.email, {
                  firstName: existing.firstName,
                  lastName: existing.lastName,
                  unsubscribed: existing.status !== 'subscribed',
                });
                updated++;
              } else {
                await this.contactModel.create({
                  email,
                  firstName,
                  lastName,
                  tags: tag ? [tag] : [],
                  source: 'import',
                  status: 'subscribed'
                });
                // Sync new
                await this.resendContacts.syncContact({
                  email,
                  firstName,
                  lastName,
                  unsubscribed: false,
                });
                added++;
              }
            }
            // Clean up file
            try { fs.unlinkSync(filePath); } catch {}
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
