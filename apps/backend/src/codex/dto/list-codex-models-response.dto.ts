import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodexModelResponseDto } from './codex-model-response.dto';

export class ListCodexModelsResponseDto {
  @ApiProperty({
    description: 'Models returned by Codex app-server.',
    isArray: true,
    type: () => CodexModelResponseDto,
  })
  models!: CodexModelResponseDto[];

  @ApiPropertyOptional({
    description: 'Opaque cursor for the next page, or null when all models have been returned.',
    example: null,
    nullable: true,
    type: String,
  })
  next_cursor!: string | null;
}
