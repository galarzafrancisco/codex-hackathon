import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListCodexThreadsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of threads to return.',
    example: 25,
    maximum: 100,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Opaque pagination cursor returned by Codex app-server.',
    example: 'next-page-token',
    type: String,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Thread sort key.',
    enum: ['created_at', 'updated_at'],
    example: 'created_at',
  })
  @IsOptional()
  @IsIn(['created_at', 'updated_at'])
  sort_key?: 'created_at' | 'updated_at';

  @ApiPropertyOptional({
    description: 'List archived threads instead of active threads.',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  archived?: boolean;

  @ApiPropertyOptional({
    description: 'Restrict results to threads whose current working directory exactly matches this path.',
    example: '/Users/me/project',
    type: String,
  })
  @IsOptional()
  @IsString()
  cwd?: string;

  @ApiPropertyOptional({
    description: 'Search stored thread summaries and metadata.',
    example: 'Fix tests',
    type: String,
  })
  @IsOptional()
  @IsString()
  search_term?: string;
}
