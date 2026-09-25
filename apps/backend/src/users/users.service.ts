import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, Role } from './schemas/user.schema.js';
import { Manuscript, ProjectStatus } from './schemas/manuscript.schema.js';
import { Payment } from '../payments/schemas/payment.schema.js';
import { CloudinaryService } from '../cloudinary.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Manuscript.name) private manuscriptModel: Model<Manuscript>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private cloudinary: CloudinaryService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 1. First step of onboarding: submit manuscript data and basic info
  async submitManuscriptData(data: any) {
    let user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      user = new this.userModel({
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: Role.AUTHOR,
        isAuthorOnboarded: false,
      });
      await user.save();
    }

    const manuscript = new this.manuscriptModel({
      author: user._id,
      bookTitle: data.bookTitle,
      genre: data.genre,
      wordCount: data.wordCount,
      targetAudience: data.targetAudience,
      bookDescription: data.bookDescription,
      authorBio: data.authorBio,
      previousPublications: data.previousPublications,
      publishingPreference: data.publishingPreference,
    });

    await manuscript.save();
    
    this.eventEmitter.emit('manuscript.submitted', { email: user.email, userId: user._id });
    
    return { user, manuscript };
  }

  // 2. Second step of onboarding: create password to finalize account
  async finalizeAuthorAccount(email: string, passwordPlain: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found. Please submit manuscript data first.');
    if (user.isAuthorOnboarded) throw new ConflictException('Account already finalized. Please log in.');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(passwordPlain, salt);
    user.isAuthorOnboarded = true;
    await user.save();
    
    this.eventEmitter.emit('user.registered', { email: user.email, userId: user._id });
    
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // === AUTHOR PORTAL ===
  async getMyPortal(userId: string) {
    const author = await this.userModel.findById(userId).select('-password');
    if (!author) throw new NotFoundException('Author not found');
    const projects = await this.manuscriptModel.find({ author: userId }).exec();
    const payments = await this.paymentModel.find({ user: userId }).exec();
    return { author, projects, payments };
  }

  async uploadManuscriptFileVersion(projectId: string, userId: string, file: any) {
    const project = await this.manuscriptModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    if (project.author.toString() !== userId.toString()) {
      throw new UnauthorizedException('You do not have permission to upload to this project');
    }

    // Live Cloudinary Upload for .doc / .docx
    const result = await this.cloudinary.uploadFile(file, 'raw');

    project.versions.push({
      fileUrl: result.secure_url,
      uploadedAt: new Date()
    });

    await project.save();
    return project;
  }

  // === ADMIN CRM METHODS ===

  // Get all projects (manuscripts) with author info populated
  async getAllProjects() {
    return this.manuscriptModel
      .find()
      .populate('author', 'name email phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Update a project's production status
  async updateProjectStatus(id: string, status: ProjectStatus) {
    const manuscript = await this.manuscriptModel.findById(id).populate('author');
    if (!manuscript) throw new NotFoundException('Project not found');
    manuscript.status = status;
    await manuscript.save();
    
    const author: any = manuscript.author;
    if (author && author.email) {
      this.eventEmitter.emit('project.status_changed', { email: author.email, userId: author._id, data: { status } });
    }
    
    return manuscript;
  }

  // Get all authors list
  async getAllAuthors() {
    return this.userModel
      .find({ role: Role.AUTHOR })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get a single author's full 360-degree CRM profile
  async getAuthorProfile(id: string) {
    const author = await this.userModel.findById(id).select('-password');
    if (!author) throw new NotFoundException('Author not found');

    const projects = await this.manuscriptModel.find({ author: id }).exec();
    const payments = await this.paymentModel.find({ user: id }).exec();

    return { author, projects, payments };
  }

  // Seed an admin user if none exists
  async seedAdmin() {
    const existing = await this.userModel.findOne({ role: Role.ADMIN });
    if (existing) return;

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Admin@Eyelight2025', salt);

    const admin = new this.userModel({
      email: 'admin@eyelightpublishers.com',
      name: 'Eyelight Admin',
      phone: '',
      role: Role.ADMIN,
      isAuthorOnboarded: true,
      password,
    });
    await admin.save();
    console.log('✅ Admin user seeded: admin@eyelightpublishers.com / Admin@Eyelight2025');
  }
}
