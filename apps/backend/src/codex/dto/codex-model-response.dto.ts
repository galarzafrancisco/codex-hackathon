import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CodexReasoningEffortResponseDto {
  @ApiProperty({
    description: 'Reasoning effort value accepted by the Codex model.',
    example: 'medium',
    type: String,
  })
  reasoning_effort!: string;

  @ApiPropertyOptional({
    description: 'Human-readable description of the effort option.',
    example: 'Balances latency and reasoning depth.',
    nullable: true,
    type: String,
  })
  description!: string | null;
}

export class CodexModelResponseDto {
  @ApiProperty({
    description: 'Stable model identifier returned by Codex app-server.',
    example: 'gpt-5.4',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: 'Model value to send when starting Codex threads.',
    example: 'gpt-5.4',
    type: String,
  })
  model!: string;

  @ApiPropertyOptional({
    description: 'Display label suitable for model selectors.',
    example: 'GPT-5.4',
    nullable: true,
    type: String,
  })
  display_name!: string | null;

  @ApiProperty({
    description: 'Whether Codex marks this model as hidden from default pickers.',
    example: false,
    type: Boolean,
  })
  hidden!: boolean;

  @ApiPropertyOptional({
    description: 'Default reasoning effort recommended by Codex for this model.',
    example: 'medium',
    nullable: true,
    type: String,
  })
  default_reasoning_effort!: string | null;

  @ApiProperty({
    description: 'Reasoning effort options supported by the model.',
    isArray: true,
    type: () => CodexReasoningEffortResponseDto,
  })
  supported_reasoning_efforts!: CodexReasoningEffortResponseDto[];

  @ApiProperty({
    description: 'Input modalities accepted by the model.',
    example: ['text', 'image'],
    isArray: true,
    type: String,
  })
  input_modalities!: string[];

  @ApiPropertyOptional({
    description: 'Whether the model supports personality-specific instructions.',
    example: true,
    nullable: true,
    type: Boolean,
  })
  supports_personality!: boolean | null;

  @ApiProperty({
    description: 'Whether Codex marks this as the recommended default model.',
    example: true,
    type: Boolean,
  })
  is_default!: boolean;
}
