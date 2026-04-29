import { ClientConfig } from './base-client.js';
import { HealthResource } from './health-resource.js';

export class ApiClient {
  public readonly health: HealthResource;

  constructor(config: ClientConfig) {
    this.health = new HealthResource(config);
  }
}