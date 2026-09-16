import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { AutomationsService } from './automations.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';

@Controller('automations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  findAll() {
    return this.automationsService.findAll();
  }

  @Post(':triggerEvent')
  upsert(
    @Param('triggerEvent') triggerEvent: string,
    @Body() body: any
  ) {
    return this.automationsService.upsertAutomation(triggerEvent, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.automationsService.remove(id);
  }
}
