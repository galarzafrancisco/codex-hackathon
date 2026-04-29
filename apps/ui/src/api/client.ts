import { ApiClient } from '../../generated/index.js';

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:2001';

export const apiClient = new ApiClient({
  baseUrl: defaultBaseUrl,
});

export { ApiClient };
export type { ClientConfig, HealthResponseDto } from '../../generated/index.js';
