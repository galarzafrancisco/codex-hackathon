import { ApiProperty } from '@nestjs/swagger';
import { CodexThreadResponseDto } from './codex-thread-response.dto';

export class StartCodexThreadResponseDto {
  @ApiProperty({
    description: 'Thread created by Codex app-server.',
    type: () => CodexThreadResponseDto,
  })
  thread!: CodexThreadResponseDto;
}
