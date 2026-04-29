import { ApiProperty } from '@nestjs/swagger';

export class IssueBlockerRefResponseDto {
  @ApiProperty({
    description: 'Stable tracker-internal ID for the blocking issue when known.',
    example: 'issue_01HZY8Z3P8M5N7R1E2A4C6D9F1',
    nullable: true,
    type: String,
  })
  id!: string | null;

  @ApiProperty({
    description: 'Human-readable ticket key for the blocking issue when known.',
    example: 'ABC-122',
    nullable: true,
    type: String,
  })
  identifier!: string | null;

  @ApiProperty({
    description: 'Current tracker state name for the blocking issue when known.',
    example: 'In Progress',
    nullable: true,
    type: String,
  })
  state!: string | null;

  @ApiProperty({
    description: 'Tracker creation timestamp for the blocking issue when known.',
    example: '2026-04-29T00:00:00.000Z',
    format: 'date-time',
    nullable: true,
    type: String,
  })
  created_at!: string | null;

  @ApiProperty({
    description: 'Tracker update timestamp for the blocking issue when known.',
    example: '2026-04-29T01:00:00.000Z',
    format: 'date-time',
    nullable: true,
    type: String,
  })
  updated_at!: string | null;
}
