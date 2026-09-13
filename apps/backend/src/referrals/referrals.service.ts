import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Referral, ReferralStatus } from './schemas/referral.schema.js';
import { User, Role } from '../users/schemas/user.schema.js';
import { EmailService } from '../email/email.service.js';
import * as crypto from 'crypto';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<Referral>,
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  // Generate a unique referral code for an author
  generateCode(userId: string): string {
    const hash = crypto.createHash('sha256').update(userId + Date.now().toString()).digest('hex');
    return `EYE-${hash.substring(0, 8).toUpperCase()}`;
  }

  // Get or create a referral code for the logged-in author
  async getMyReferralInfo(userId: string) {
    // Check if user already has referrals
    let existingReferrals = await this.referralModel.find({ referrer: userId });

    // Generate a referral code based on user ID (deterministic so it stays the same)
    const code = `EYE-${userId.toString().substring(0, 8).toUpperCase()}`;

    // Stats
    const totalReferred = existingReferrals.length;
    const completed = existingReferrals.filter(r => r.status === ReferralStatus.COMPLETED || r.status === ReferralStatus.CREDITED).length;
    const totalCredits = existingReferrals.filter(r => r.status === ReferralStatus.CREDITED).reduce((sum, r) => sum + r.creditAmount, 0);

    return {
      code,
      referralLink: `https://eyelightpublishing.com/submit-manuscript?ref=${code}`,
      stats: {
        totalReferred,
        completed,
        totalCredits,
      },
      referrals: existingReferrals,
    };
  }

  // Track when someone signs up through a referral link
  async trackReferral(referralCode: string, referredEmail: string, referredUserId: string) {
    // Find the referrer by matching their code pattern
    // The code is EYE-{first 8 chars of userId}
    const userIdPrefix = referralCode.replace('EYE-', '').toLowerCase();

    const referrer = await this.userModel.findOne({
      _id: { $regex: new RegExp(`^${userIdPrefix}`, 'i') }
    });

    if (!referrer) {
      // Fallback: search existing referrals for this code
      const existingRef = await this.referralModel.findOne({ referralCode: referralCode });
      if (!existingRef) return null; // Invalid code
    }

    // Find referrer from existing referrals or use direct match
    let referrerId: Types.ObjectId;
    const existingRefByCode = await this.referralModel.findOne({ referralCode: referralCode });
    if (existingRefByCode) {
      referrerId = existingRefByCode.referrer;
    } else {
      // Try to find the user whose ID starts with the code suffix
      const allUsers = await this.userModel.find({ role: Role.AUTHOR });
      const matchingUser = allUsers.find((u: any) => u._id.toString().substring(0, 8).toUpperCase() === userIdPrefix.toUpperCase());
      if (!matchingUser) return null;
      referrerId = (matchingUser as any)._id as Types.ObjectId;
    }

    const referral = new this.referralModel({
      referrer: referrerId,
      referred: referredUserId,
      referralCode: referralCode,
      referredEmail: referredEmail,
      status: ReferralStatus.PENDING,
    });

    await referral.save();

    // Notify the referrer
    const referrerUser = await this.userModel.findById(referrerId);
    if (referrerUser) {
      await this.emailService.sendEmail(
        referrerUser.email,
        'Someone signed up through your referral! 🎉',
        `<p>Hi ${referrerUser.name},</p>
         <p>Great news! <strong>${referredEmail}</strong> just signed up for Eyelight Publishing using your referral link.</p>
         <p>Once they complete their publishing journey, you'll receive your publishing credit.</p>
         <p>Keep sharing your link to earn more!</p>
         <p>— The Eyelight Publishing Team</p>`,
      );
    }

    return referral;
  }

  // Admin: Get all referrals
  async findAll() {
    return this.referralModel
      .find()
      .populate('referrer', 'name email')
      .populate('referred', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Admin: Mark a referral as completed/credited
  async updateStatus(id: string, status: ReferralStatus, creditAmount?: number) {
    const referral = await this.referralModel.findById(id);
    if (!referral) throw new NotFoundException('Referral not found');
    referral.status = status;
    if (creditAmount) referral.creditAmount = creditAmount;
    return referral.save();
  }
}
