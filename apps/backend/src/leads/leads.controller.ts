import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Public: Accept newsletter/consultation signups from the website
  @Post()
  create(@Body() body: any) {
    return this.leadsService.create(body);
  }

  // Admin: View all leads / audience list
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.leadsService.findAll();
  }

  // Admin: Bulk import
  @Post('bulk')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  bulkCreate(@Body() body: { leads: any[] }) {
    return this.leadsService.bulkCreate(body.leads);
  }
}
