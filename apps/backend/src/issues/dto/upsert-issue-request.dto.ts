import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { IssueBlockerRefRequestDto } from './issue-blocker-ref-request.dto';

export class UpsertIssueRequestDto {
  @ApiProperty({
    description: 'Human-readable ticket key.',
    example: 'ABC-123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  identifier!: string;

  @ApiProperty({
    description: 'Issue title.',
    example: 'Implement worker dispatch queue',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  title!: string;

  @ApiPropertyOptional({
    description: 'Issue description, if the tracker provided one.',
    example: 'Build the queue used by orchestration to dispatch agent runs.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Dispatch priority. Lower numbers are higher priority.',
    example: 1,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  priority?: number | null;

  @ApiProperty({
    description: 'Current tracker state name.',
    example: 'Ready',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  state!: string;

  @ApiPropertyOptional({
    description: 'Tracker-provided branch metadata if available.',
    example: 'feature/abc-123-worker-dispatch',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  branch_name?: string | null;

  @ApiPropertyOptional({
    description: 'Tracker issue URL if available.',
    example: 'https://tracker.example.com/ABC-123',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  url?: string | null;

  @ApiPropertyOptional({
    description: 'Issue labels. Values are normalized to lowercase before storage.',
    example: ['Backend', 'Orchestration'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiPropertyOptional({
    description: 'Normalized blocker references for the issue.',
    isArray: true,
    type: () => IssueBlockerRefRequestDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueBlockerRefRequestDto)
  blocked_by?: IssueBlockerRefRequestDto[];
}
