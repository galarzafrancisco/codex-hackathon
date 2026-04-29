import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function normalizeArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export class SendCodexThreadMessageQueryDto {
  @ApiProperty({
    description: 'User text to send to Codex as the next turn input.',
    example: '$github Summarize the latest issue updates.',
    type: String,
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: 'App connector mention names. Pair by index with mention_path.',
    example: ['GitHub'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsString({ each: true })
  mention_name?: string[];

  @ApiPropertyOptional({
    description: 'Codex app-server mention paths. Pair by index with mention_name.',
    example: ['app://github'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsString({ each: true })
  mention_path?: string[];

  @ApiPropertyOptional({
    description: 'Skill names. Pair by index with skill_path.',
    example: ['skill-creator'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsString({ each: true })
  skill_name?: string[];

  @ApiPropertyOptional({
    description: 'Absolute skill paths. Pair by index with skill_name.',
    example: ['/Users/me/.codex/skills/skill-creator/SKILL.md'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsString({ each: true })
  skill_path?: string[];

  @ApiPropertyOptional({
    description: 'Absolute local image paths to include with the turn.',
    example: ['/tmp/screenshot.png'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsString({ each: true })
  local_image_path?: string[];

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
    description: 'JSON-encoded sandbox policy object to pass through to Codex app-server turn/start.',
    example: '{"type":"workspaceWrite","networkAccess":false}',
    type: String,
  })
  @IsOptional()
  @IsString()
  sandbox_policy_json?: string;

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
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  resume?: boolean;
}
