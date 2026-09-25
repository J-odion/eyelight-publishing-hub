import { 
  Controller, Get, Post, Patch, Delete, Body, Param, Query, 
  UseInterceptors, UploadedFile, BadRequestException, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/schemas/user.schema.js';
import { CrmService } from './crm.service.js';

@Controller('crm')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('lists')
  getLists() {
    return this.crmService.getLists();
  }

  @Post('lists')
  createList(@Body() body: { name: string; type: string; query?: any }) {
    return this.crmService.createList(body.name, body.type, body.query);
  }

  @Delete('lists/:id')
  deleteList(@Param('id') id: string) {
    return this.crmService.deleteList(id);
  }

  @Get('contacts')
  getContacts(
    @Query('tag') tag?: string,
    @Query('list') list?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.crmService.getContacts(tag, list, search, limit ? +limit : 50, skip ? +skip : 0);
  }

  @Get('contacts/tags')
  getTags() {
    return this.crmService.getTags();
  }

  @Post('contacts')
  createContact(@Body() body: any) {
    return this.crmService.createContact(body);
  }

  @Patch('contacts/:id')
  updateContact(@Param('id') id: string, @Body() body: any) {
    return this.crmService.updateContact(id, body);
  }

  @Post('contacts/:id/add-to-list')
  addContactToList(@Param('id') id: string, @Body() body: { listId: string }) {
    return this.crmService.addContactToList(id, body.listId);
  }

  @Post('contacts/import')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async importContacts(
    @UploadedFile() file: any,
    @Body('tag') tag: string
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const result = await this.crmService.importContacts(file.path, tag);
    return result;
  }
}
