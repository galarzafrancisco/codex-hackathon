export type CodexReasoningEffortResult = {
  reasoningEffort: string;
  description: string | null;
};

export type CodexModelResult = {
  id: string;
  model: string;
  displayName: string | null;
  hidden: boolean;
  defaultReasoningEffort: string | null;
  supportedReasoningEfforts: CodexReasoningEffortResult[];
  inputModalities: string[];
  supportsPersonality: boolean | null;
  isDefault: boolean;
};

export type ListCodexModelsInput = {
  limit?: number;
  cursor?: string | null;
  includeHidden?: boolean;
};

export type ListCodexModelsResult = {
  models: CodexModelResult[];
  nextCursor: string | null;
};

export type CodexThreadStatusResult = {
  type: string;
  activeFlags: string[];
};

export type CodexThreadResult = {
  id: string;
  name: string | null;
  preview: string | null;
  ephemeral: boolean;
  modelProvider: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  status: CodexThreadStatusResult | null;
};

export type ListCodexThreadsInput = {
  limit?: number;
  cursor?: string | null;
  sortKey?: 'created_at' | 'updated_at';
  archived?: boolean;
  cwd?: string | null;
  searchTerm?: string | null;
  sourceKinds?: string[];
  modelProviders?: string[];
};

export type ListCodexThreadsResult = {
  threads: CodexThreadResult[];
  nextCursor: string | null;
};

export type StartCodexThreadInput = {
  model?: string;
  cwd?: string;
  approvalPolicy?: string;
  sandbox?: string;
  personality?: string;
  serviceName?: string;
};

export type StartCodexThreadResult = {
  thread: CodexThreadResult;
};
