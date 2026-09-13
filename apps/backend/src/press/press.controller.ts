import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PressService } from './press.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';

@Controller('press')
export class PressController {
  constructor(private readonly pressService: PressService) {}

  // Public: Browse all press assets
  @Get()
  findAll(@Query('type') type?: string) {
    if (type) return this.pressService.findByType(type);
    return this.pressService.findAll();
  }

  // Admin: Manage press assets
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.pressService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.pressService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.pressService.remove(id);
  }
}
