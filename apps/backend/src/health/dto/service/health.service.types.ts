export type HealthStatus = 'ok';

export interface HealthResult {
  status: HealthStatus;
  service: string;
  timestamp: Date;
}
