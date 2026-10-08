import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';
import { ActivitiesService } from './activities.service.js';

@Controller('activities')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SALES_MANAGER, Role.SALES_REP)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  createActivity(@Body() body: any) {
    return this.activitiesService.createActivity(body);
  }

  @Get()
  getActivities(
    @Query('contactId') contactId?: string,
    @Query('dealId') dealId?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.activitiesService.getActivities(contactId, dealId, ownerId);
  }

  @Patch(':id')
  updateActivity(@Param('id') id: string, @Body() body: any) {
    return this.activitiesService.updateActivity(id, body);
  }

  @Delete(':id')
  deleteActivity(@Param('id') id: string) {
    return this.activitiesService.deleteActivity(id);
  }
}
