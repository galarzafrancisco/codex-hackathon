import { BaseClient, ClientConfig } from './base-client.js';
import type { CreateIssueRequestDto, IssueResponseDto, ListIssuesResponseDto, UpsertIssueRequestDto } from './types.js';

export class IssuesResource extends BaseClient {
  constructor(config: ClientConfig) {
    super(config);
  }

  /** List normalized issues */
  async IssuesController_listIssues(params?: { signal?: AbortSignal }): Promise<ListIssuesResponseDto> {
    return this.request('GET', '/api/v1/issues', { signal: params?.signal });
  }

  /** Create a tracker issue */
  async IssuesController_createIssue(params: { body: CreateIssueRequestDto; signal?: AbortSignal }): Promise<IssueResponseDto> {
    return this.request('POST', '/api/v1/issues', { body: params.body, signal: params?.signal });
  }

  /** Read a normalized issue */
  async IssuesController_getIssue(params: { id: string; signal?: AbortSignal }): Promise<IssueResponseDto> {
    return this.request('GET', `/api/v1/issues/${params.id}`, { signal: params?.signal });
  }

  /** Create or replace a normalized issue */
  async IssuesController_upsertIssue(params: { id: string; body: UpsertIssueRequestDto; signal?: AbortSignal }): Promise<IssueResponseDto> {
    return this.request('PUT', `/api/v1/issues/${params.id}`, { body: params.body, signal: params?.signal });
  }

}