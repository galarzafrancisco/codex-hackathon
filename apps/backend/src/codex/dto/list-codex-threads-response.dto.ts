import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodexThreadResponseDto } from './codex-thread-response.dto';

export class ListCodexThreadsResponseDto {
  @ApiProperty({
    description: 'Threads returned by Codex app-server.',
    isArray: true,
    type: () => CodexThreadResponseDto,
  })
  threads!: CodexThreadResponseDto[];

  @ApiPropertyOptional({
    description: 'Opaque cursor for the next page, or null when all threads have been returned.',
    example: null,
    nullable: true,
    type: String,
  })
  next_cursor!: string | null;
}
