import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartCodexThreadRequestDto {
  @ApiPropertyOptional({
    description: 'Model to use for the new Codex thread. Omit to let Codex choose its default.',
    example: 'gpt-5.4',
    type: String,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Working directory for the new Codex thread.',
    example: '/Users/me/project',
    type: String,
  })
  @IsOptional()
  @IsString()
  cwd?: string;

  @ApiPropertyOptional({
    description: 'Approval policy override for the new thread.',
    enum: ['untrusted', 'on-request', 'never'],
    example: 'on-request',
  })
  @IsOptional()
  @IsIn(['untrusted', 'on-request', 'never'])
  approval_policy?: string;

  @ApiPropertyOptional({
    description: 'Sandbox policy override for the new thread.',
    enum: ['readOnly', 'workspaceWrite', 'dangerFullAccess'],
    example: 'workspaceWrite',
  })
  @IsOptional()
  @IsIn(['readOnly', 'workspaceWrite', 'dangerFullAccess'])
  sandbox?: string;

  @ApiPropertyOptional({
    description: 'Codex personality preset for the new thread.',
    example: 'friendly',
    type: String,
  })
  @IsOptional()
  @IsString()
  personality?: string;

  @ApiPropertyOptional({
    description: 'Service name attached to thread-level Codex metrics.',
    example: 'codex_symphony_demo',
    type: String,
  })
  @IsOptional()
  @IsString()
  service_name?: string;
}
