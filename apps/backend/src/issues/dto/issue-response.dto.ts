import { ApiProperty } from '@nestjs/swagger';
import { IssueBlockerRefResponseDto } from './issue-blocker-ref-response.dto';

export class IssueResponseDto {
  @ApiProperty({
    description: 'Stable tracker-internal issue ID.',
    example: 'issue_01HZY8Z3P8M5N7R1E2A4C6D9F0',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: 'Human-readable ticket key.',
    example: 'ABC-123',
    type: String,
  })
  identifier!: string;

  @ApiProperty({
    description: 'Issue title.',
    example: 'Implement worker dispatch queue',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: 'Issue description, if the tracker provided one.',
    example: 'Build the queue used by orchestration to dispatch agent runs.',
    nullable: true,
    type: String,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Dispatch priority. Lower numbers are higher priority.',
    example: 1,
    nullable: true,
    type: Number,
  })
  priority!: number | null;

  @ApiProperty({
    description: 'Current tracker state name.',
    example: 'Ready',
    type: String,
  })
  state!: string;

  @ApiProperty({
    description: 'Tracker-provided branch metadata if available.',
    example: 'feature/abc-123-worker-dispatch',
    nullable: true,
    type: String,
  })
  branch_name!: string | null;

  @ApiProperty({
    description: 'Tracker issue URL if available.',
    example: 'https://tracker.example.com/ABC-123',
    nullable: true,
    type: String,
  })
  url!: string | null;

  @ApiProperty({
    description: 'Lowercase normalized issue labels.',
    example: ['backend', 'orchestration'],
    isArray: true,
    type: String,
  })
  labels!: string[];

  @ApiProperty({
    description: 'Normalized blocker references for the issue.',
    isArray: true,
    type: () => IssueBlockerRefResponseDto,
  })
  blocked_by!: IssueBlockerRefResponseDto[];
}
