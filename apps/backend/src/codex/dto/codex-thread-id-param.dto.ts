import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CodexThreadIdParamDto {
  @ApiProperty({
    description: 'Stable Codex thread identifier.',
    example: 'thr_123',
    type: String,
  })
  @IsString()
  thread_id!: string;
}
