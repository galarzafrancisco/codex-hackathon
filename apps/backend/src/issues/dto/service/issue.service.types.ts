export interface IssueBlockerRefInput {
  id?: string | null;
  identifier?: string | null;
  state?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface UpsertIssueInput {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  priority?: number | null;
  state: string;
  branchName?: string | null;
  url?: string | null;
  labels?: string[];
  blockedBy?: IssueBlockerRefInput[];
}

export interface CreateIssueInput {
  identifier: string;
  title: string;
  description?: string | null;
  priority?: number | null;
  state: string;
  branchName?: string | null;
  url?: string | null;
  labels?: string[];
  blockedBy?: IssueBlockerRefInput[];
}

export interface IssueBlockerRefResult {
  id: string | null;
  identifier: string | null;
  state: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IssueResult {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: number | null;
  state: string;
  branchName: string | null;
  url: string | null;
  labels: string[];
  blockedBy: IssueBlockerRefResult[];
}
