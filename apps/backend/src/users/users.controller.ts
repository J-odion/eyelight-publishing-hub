import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from './schemas/user.schema.js';
import { ProjectStatus } from './schemas/manuscript.schema.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // === PUBLIC: Author Onboarding ===
  @Post('submit-manuscript')
  submitManuscriptData(@Body() body: any) {
    return this.usersService.submitManuscriptData(body);
  }

  @Post('finalize-account')
  finalizeAccount(@Body() body: { email: string; passwordPlain: string }) {
    return this.usersService.finalizeAuthorAccount(body.email, body.passwordPlain);
  }

  // === AUTHOR PORTAL: Protected by JWT ===
  @Get('portal')
  @UseGuards(AuthGuard('jwt'))
  getMyPortal(@Req() req: any) {
    return this.usersService.getMyPortal(req.user._id);
  }

  // === ADMIN: Production Board ===
  @Get('projects')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getAllProjects() {
    return this.usersService.getAllProjects();
  }

  @Patch('projects/:id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateProjectStatus(@Param('id') id: string, @Body('status') status: ProjectStatus) {
    return this.usersService.updateProjectStatus(id, status);
  }

  // === ADMIN: Author Directory & Profiles ===
  @Get('authors')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getAllAuthors() {
    return this.usersService.getAllAuthors();
  }

  @Get('authors/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getAuthorProfile(@Param('id') id: string) {
    return this.usersService.getAuthorProfile(id);
  }
}
