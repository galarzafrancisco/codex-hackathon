import { ClientConfig } from './base-client.js';
import { HealthResource } from './health-resource.js';
import { IssuesResource } from './issues-resource.js';

export class ApiClient {
  public readonly health: HealthResource;
  public readonly issues: IssuesResource;

  constructor(config: ClientConfig) {
    this.health = new HealthResource(config);
    this.issues = new IssuesResource(config);
  }
}