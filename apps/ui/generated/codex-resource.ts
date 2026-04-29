import { BaseClient, ClientConfig } from './base-client.js';
import type { ListCodexModelsResponseDto, ListCodexThreadsResponseDto, StartCodexThreadRequestDto, StartCodexThreadResponseDto } from './types.js';

export class CodexResource extends BaseClient {
  constructor(config: ClientConfig) {
    super(config);
  }

  /** List Codex app-server models */
  async CodexController_listModels(params?: { include_hidden?: boolean; cursor?: string; limit?: number; signal?: AbortSignal }): Promise<ListCodexModelsResponseDto> {
    return this.request('GET', '/api/v1/codex/models', { params: { include_hidden: params?.include_hidden, cursor: params?.cursor, limit: params?.limit }, signal: params?.signal });
  }

  /** List Codex app-server threads */
  async CodexController_listThreads(params?: { search_term?: string; cwd?: string; archived?: boolean; sort_key?: 'created_at' | 'updated_at'; cursor?: string; limit?: number; signal?: AbortSignal }): Promise<ListCodexThreadsResponseDto> {
    return this.request('GET', '/api/v1/codex/threads', { params: { search_term: params?.search_term, cwd: params?.cwd, archived: params?.archived, sort_key: params?.sort_key, cursor: params?.cursor, limit: params?.limit }, signal: params?.signal });
  }

  /** Start a new Codex app-server thread */
  async CodexController_startThread(params: { body: StartCodexThreadRequestDto; signal?: AbortSignal }): Promise<StartCodexThreadResponseDto> {
    return this.request('POST', '/api/v1/codex/threads', { body: params.body, signal: params?.signal });
  }

}