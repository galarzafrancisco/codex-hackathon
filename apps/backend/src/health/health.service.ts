import { Injectable } from '@nestjs/common';
import type { HealthResult } from './dto/service/health.service.types';

@Injectable()
export class HealthService {
  getHealth(): HealthResult {
    return {
      status: 'ok',
      service: 'backend',
      timestamp: new Date(),
    };
  }
}
