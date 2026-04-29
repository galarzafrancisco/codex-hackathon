import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CodexThreadTurnParamDto {
  @ApiProperty({
    description: 'Stable Codex thread identifier.',
    example: 'thr_123',
    type: String,
  })
  @IsString()
  thread_id!: string;

  @ApiProperty({
    description: 'Stable Codex turn identifier.',
    example: 'turn_456',
    type: String,
  })
  @IsString()
  turn_id!: string;
}
