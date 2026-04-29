import { BaseClient, ClientConfig } from './base-client.js';
import type { ListCodexModelsResponseDto, ListCodexThreadsResponseDto, StartCodexThreadRequestDto, StartCodexThreadResponseDto, SteerCodexTurnRequestDto, SteerCodexTurnResponseDto } from './types.js';

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

  /** Send a Codex thread message and stream app-server events */
  async *CodexController_sendThreadMessage(params: { thread_id: string; resume?: boolean; personality?: string; summary?: 'auto' | 'concise' | 'detailed' | 'none'; effort?: string; sandbox_policy_json?: string; approval_policy?: 'untrusted' | 'on-request' | 'never'; cwd?: string; model?: string; local_image_path?: string[]; skill_path?: string[]; skill_name?: string[]; mention_path?: string[]; mention_name?: string[]; message: string; signal?: AbortSignal }): AsyncIterable<any> {
    yield* this.streamEvents(`/api/v1/codex/threads/${params.thread_id}/messages/stream`, { params: { resume: params.resume, personality: params.personality, summary: params.summary, effort: params.effort, sandbox_policy_json: params.sandbox_policy_json, approval_policy: params.approval_policy, cwd: params.cwd, model: params.model, local_image_path: params.local_image_path, skill_path: params.skill_path, skill_name: params.skill_name, mention_path: params.mention_path, mention_name: params.mention_name, message: params.message }, signal: params?.signal });
  }

  /** Append user input to an active Codex turn */
  async CodexController_steerTurn(params: { turn_id: string; thread_id: string; body: SteerCodexTurnRequestDto; signal?: AbortSignal }): Promise<SteerCodexTurnResponseDto> {
    return this.request('POST', `/api/v1/codex/threads/${params.thread_id}/turns/${params.turn_id}/steer`, { body: params.body, signal: params?.signal });
  }

}