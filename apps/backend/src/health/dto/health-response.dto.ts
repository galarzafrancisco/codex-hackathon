import { ApiProperty } from '@nestjs/swagger';
import type { HealthStatus } from './service/health.service.types';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Current backend health status.',
    enum: ['ok'],
    example: 'ok',
  })
  status!: HealthStatus;

  @ApiProperty({
    description: 'Stable service identifier for the backend API.',
    example: 'backend',
    type: String,
  })
  service!: string;

  @ApiProperty({
    description: 'UTC timestamp for when the health response was produced.',
    example: '2026-04-29T00:00:00.000Z',
    format: 'date-time',
    type: String,
  })
  timestamp!: string;
}
