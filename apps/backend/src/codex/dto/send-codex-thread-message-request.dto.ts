import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CodexMentionInputDto {
  @ApiProperty({
    description: 'User-facing connector or mention name.',
    example: 'GitHub',
    type: String,
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Codex app-server mention path, such as an app connector URI.',
    example: 'app://github',
    type: String,
  })
  @IsString()
  path!: string;
}

export class CodexSkillInputDto {
  @ApiProperty({
    description: 'Skill name to invoke.',
    example: 'skill-creator',
    type: String,
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Absolute path to the skill SKILL.md file.',
    example: '/Users/me/.codex/skills/skill-creator/SKILL.md',
    type: String,
  })
  @IsString()
  path!: string;
}

export class CodexLocalImageInputDto {
  @ApiProperty({
    description: 'Absolute path to a local image file.',
    example: '/tmp/screenshot.png',
    type: String,
  })
  @IsString()
  path!: string;
}

export class SendCodexThreadMessageRequestDto {
  @ApiProperty({
    description: 'User text to send to Codex as the next turn input.',
    example: '$github Summarize the latest issue updates.',
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

  @ApiPropertyOptional({
    description: 'Model override for this and later turns on the thread.',
    example: 'gpt-5.4',
    type: String,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Working directory override for this and later turns on the thread.',
    example: '/Users/me/project',
    type: String,
  })
  @IsOptional()
  @IsString()
  cwd?: string;

  @ApiPropertyOptional({
    description: 'Approval policy override for this turn.',
    enum: ['untrusted', 'on-request', 'never'],
    example: 'on-request',
  })
  @IsOptional()
  @IsIn(['untrusted', 'on-request', 'never'])
  approval_policy?: string;

  @ApiPropertyOptional({
    description: 'Sandbox policy object to pass through to Codex app-server turn/start.',
    example: { type: 'workspaceWrite', networkAccess: false },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  sandbox_policy?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Reasoning effort override for this and later turns on the thread.',
    example: 'medium',
    type: String,
  })
  @IsOptional()
  @IsString()
  effort?: string;

  @ApiPropertyOptional({
    description: 'Reasoning summary override for this and later turns on the thread.',
    enum: ['auto', 'concise', 'detailed', 'none'],
    example: 'concise',
  })
  @IsOptional()
  @IsIn(['auto', 'concise', 'detailed', 'none'])
  summary?: string;

  @ApiPropertyOptional({
    description: 'Codex personality override for this and later turns on the thread.',
    example: 'friendly',
    type: String,
  })
  @IsOptional()
  @IsString()
  personality?: string;

  @ApiPropertyOptional({
    description: 'Resume and subscribe to the thread before starting the turn.',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  resume?: boolean;
}
