import { BaseClient, ClientConfig } from './base-client.js';
import type { HealthResponseDto } from './types.js';

export class HealthResource extends BaseClient {
  constructor(config: ClientConfig) {
    super(config);
  }

  /** Read backend health */
  async HealthController_getHealth(params?: { signal?: AbortSignal }): Promise<HealthResponseDto> {
    return this.request('GET', '/api/v1/health', { signal: params?.signal });
  }

}