import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CodexThreadStatusResponseDto {
  @ApiProperty({
    description: 'Runtime thread status type reported by Codex app-server.',
    example: 'notLoaded',
    type: String,
  })
  type!: string;

  @ApiProperty({
    description: 'Active status flags when the thread is currently loaded and running.',
    example: ['waitingOnApproval'],
    isArray: true,
    type: String,
  })
  active_flags!: string[];
}

export class CodexThreadResponseDto {
  @ApiProperty({
    description: 'Stable Codex thread identifier.',
    example: 'thr_123',
    type: String,
  })
  id!: string;

  @ApiPropertyOptional({
    description: 'User-facing thread name when Codex has assigned one.',
    example: 'Bug bash notes',
    nullable: true,
    type: String,
  })
  name!: string | null;

  @ApiPropertyOptional({
    description: 'Preview text for the thread history UI.',
    example: 'Fix tests',
    nullable: true,
    type: String,
  })
  preview!: string | null;

  @ApiProperty({
    description: 'Whether the Codex thread is ephemeral.',
    example: false,
    type: Boolean,
  })
  ephemeral!: boolean;

  @ApiPropertyOptional({
    description: 'Model provider recorded for the thread.',
    example: 'openai',
    nullable: true,
    type: String,
  })
  model_provider!: string | null;

  @ApiPropertyOptional({
    description: 'Thread creation time as an ISO timestamp when Codex provides it.',
    example: '2026-04-29T04:20:00.000Z',
    nullable: true,
    type: String,
  })
  created_at!: string | null;

  @ApiPropertyOptional({
    description: 'Last thread update time as an ISO timestamp when Codex provides it.',
    example: '2026-04-29T04:30:00.000Z',
    nullable: true,
    type: String,
  })
  updated_at!: string | null;

  @ApiPropertyOptional({
    description: 'Runtime status reported by Codex app-server.',
    nullable: true,
    type: () => CodexThreadStatusResponseDto,
  })
  status!: CodexThreadStatusResponseDto | null;
}
