import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailDto } from './create-email.dto.js';

export class UpdateEmailDto extends PartialType(CreateEmailDto) {}
