import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class IssueIdParamDto {
  @ApiProperty({
    description: 'Stable tracker-internal issue ID.',
    example: 'issue_01HZY8Z3P8M5N7R1E2A4C6D9F0',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  id!: string;
}
