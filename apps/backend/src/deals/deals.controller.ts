import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';
import { DealsService } from './deals.service.js';

@Controller('deals')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SALES_MANAGER, Role.SALES_REP)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post('pipelines')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  createPipeline(@Body() body: any) {
    return this.dealsService.createPipeline(body);
  }

  @Get('pipelines')
  getPipelines() {
    return this.dealsService.getPipelines();
  }

  @Patch('pipelines/:id')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  updatePipeline(@Param('id') id: string, @Body() body: any) {
    return this.dealsService.updatePipeline(id, body);
  }

  @Post()
  createDeal(@Body() body: any) {
    return this.dealsService.createDeal(body);
  }

  @Get()
  getDeals(
    @Query('pipelineId') pipelineId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.dealsService.getDeals(pipelineId, ownerId, contactId);
  }

  @Patch(':id')
  updateDeal(@Param('id') id: string, @Body() body: any) {
    return this.dealsService.updateDeal(id, body);
  }

  @Patch(':id/stage')
  updateDealStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.dealsService.updateDealStage(id, stage);
  }
}
