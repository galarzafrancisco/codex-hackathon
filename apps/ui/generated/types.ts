// Auto-generated types from OpenAPI spec
// Do not edit manually

export interface HealthResponseDto {
  status: 'ok';
  service: string;
  timestamp: string;
}

export interface CodexReasoningEffortResponseDto {
  reasoning_effort: string;
  description?: string | null;
}

export interface CodexModelResponseDto {
  id: string;
  model: string;
  display_name?: string | null;
  hidden: boolean;
  default_reasoning_effort?: string | null;
  supported_reasoning_efforts: CodexReasoningEffortResponseDto[];
  input_modalities: string[];
  supports_personality?: boolean | null;
  is_default: boolean;
}

export interface ListCodexModelsResponseDto {
  models: CodexModelResponseDto[];
  next_cursor?: string | null;
}

export interface CodexThreadStatusResponseDto {
  type: string;
  active_flags: string[];
}

export interface CodexThreadResponseDto {
  id: string;
  name?: string | null;
  preview?: string | null;
  ephemeral: boolean;
  model_provider?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: CodexThreadStatusResponseDto;
}

export interface ListCodexThreadsResponseDto {
  threads: CodexThreadResponseDto[];
  next_cursor?: string | null;
}

export interface StartCodexThreadRequestDto {
  model?: string;
  cwd?: string;
  approval_policy?: 'untrusted' | 'on-request' | 'never';
  sandbox?: 'readOnly' | 'workspaceWrite' | 'dangerFullAccess';
  personality?: string;
  service_name?: string;
}

export interface StartCodexThreadResponseDto {
  thread: CodexThreadResponseDto;
}

export interface CodexMentionInputDto {
  name: string;
  path: string;
}

export interface CodexSkillInputDto {
  name: string;
  path: string;
}

export interface CodexLocalImageInputDto {
  path: string;
}

export interface SteerCodexTurnRequestDto {
  message: string;
  mentions?: CodexMentionInputDto[];
  skills?: CodexSkillInputDto[];
  local_images?: CodexLocalImageInputDto[];
}

export interface SteerCodexTurnResponseDto {
  turn_id: string;
}

export interface IssueBlockerRefResponseDto {
  id: string | null;
  identifier: string | null;
  state: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IssueResponseDto {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: number | null;
  state: string;
  branch_name: string | null;
  url: string | null;
  labels: string[];
  blocked_by: IssueBlockerRefResponseDto[];
}

export interface ListIssuesResponseDto {
  issues: IssueResponseDto[];
}

export interface IssueBlockerRefRequestDto {
  id?: string | null;
  identifier?: string | null;
  state?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateIssueRequestDto {
  identifier: string;
  title: string;
  description?: string | null;
  priority?: number | null;
  state: string;
  branch_name?: string | null;
  url?: string | null;
  labels?: string[];
  blocked_by?: IssueBlockerRefRequestDto[];
}

export interface UpsertIssueRequestDto {
  identifier: string;
  title: string;
  description?: string | null;
  priority?: number | null;
  state: string;
  branch_name?: string | null;
  url?: string | null;
  labels?: string[];
  blocked_by?: IssueBlockerRefRequestDto[];
}
