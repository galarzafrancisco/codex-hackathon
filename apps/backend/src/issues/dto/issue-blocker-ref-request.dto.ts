import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class IssueBlockerRefRequestDto {
  @ApiPropertyOptional({
    description: 'Stable tracker-internal ID for the blocking issue when known.',
    example: 'issue_01HZY8Z3P8M5N7R1E2A4C6D9F1',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  id?: string | null;

  @ApiPropertyOptional({
    description: 'Human-readable ticket key for the blocking issue when known.',
    example: 'ABC-122',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  identifier?: string | null;

  @ApiPropertyOptional({
    description: 'Current tracker state name for the blocking issue when known.',
    example: 'In Progress',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional({
    description: 'Tracker creation timestamp for the blocking issue when known.',
    example: '2026-04-29T00:00:00.000Z',
    format: 'date-time',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  created_at?: string | null;

  @ApiPropertyOptional({
    description: 'Tracker update timestamp for the blocking issue when known.',
    example: '2026-04-29T01:00:00.000Z',
    format: 'date-time',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  updated_at?: string | null;
}
