import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HealthService)
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Read backend health' })
  @ApiOkResponse({
    description: 'The backend is running.',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    const result = this.healthService.getHealth();

    return {
      status: result.status,
      service: result.service,
      timestamp: result.timestamp.toISOString(),
    };
  }
}
