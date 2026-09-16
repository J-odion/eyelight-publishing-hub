import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrmService } from './crm.service.js';

@Controller('crm')
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

  @Get('contacts')
  getContacts(
    @Query('tag') tag?: string,
    @Query('list') list?: string,
    @Query('search') search?: string,
  ) {
    return this.crmService.getContacts(tag, list, search);
  }

  @Get('contacts/tags')
  getTags() {
    return this.crmService.getTags();
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
    
    // Tag e.g. "imported-substack"
    const result = await this.crmService.importContacts(file.path, tag);
    return result;
  }
}
