import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CodexLocalImageInputDto,
  CodexMentionInputDto,
  CodexSkillInputDto,
} from './send-codex-thread-message-request.dto';

export class SteerCodexTurnRequestDto {
  @ApiProperty({
    description: 'Additional user text to append to the active Codex turn.',
    example: 'Actually focus on the failing tests first.',
    type: String,
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: 'App connector mentions to include with the text input.',
    type: () => CodexMentionInputDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodexMentionInputDto)
  mentions?: CodexMentionInputDto[];

  @ApiPropertyOptional({
    description: 'Skills to include with the text input.',
    type: () => CodexSkillInputDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodexSkillInputDto)
  skills?: CodexSkillInputDto[];

  @ApiPropertyOptional({
    description: 'Local images to include with the text input.',
    type: () => CodexLocalImageInputDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodexLocalImageInputDto)
  local_images?: CodexLocalImageInputDto[];
}
