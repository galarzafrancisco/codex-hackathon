import { ApiProperty } from '@nestjs/swagger';

export class SteerCodexTurnResponseDto {
  @ApiProperty({
    description: 'Accepted active turn identifier.',
    example: 'turn_456',
    type: String,
  })
  turn_id!: string;
}
