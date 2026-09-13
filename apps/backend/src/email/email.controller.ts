import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.emailService.getAllCampaigns();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.emailService.createCampaign(body);
  }
}
