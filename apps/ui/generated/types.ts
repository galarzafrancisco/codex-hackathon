// Auto-generated types from OpenAPI spec
// Do not edit manually

export interface HealthResponseDto {
  status: 'ok';
  service: string;
  timestamp: string;
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
