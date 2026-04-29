import { Inject, Injectable } from '@nestjs/common';
import { CodexAppServerRpcClient } from './codex-app-server-rpc.client';
import type { CodexAppServerInputItem } from './codex-app-server-rpc.client';
import type {
  CodexLocalImageInput,
  CodexModelResult,
  CodexSkillInput,
  CodexThreadResult,
  CodexThreadMessageStreamEventResult,
  ListCodexModelsInput,
  ListCodexModelsResult,
  ListCodexThreadsInput,
  ListCodexThreadsResult,
  SendCodexThreadMessageInput,
  StartCodexThreadInput,
  StartCodexThreadResult,
  SteerCodexTurnInput,
  SteerCodexTurnResult,
} from './dto/service/codex.service.types';

type CodexPage<T> = {
  data?: T[];
  nextCursor?: string | null;
};

type CodexModelWire = {
  id?: unknown;
  model?: unknown;
  displayName?: unknown;
  hidden?: unknown;
  defaultReasoningEffort?: unknown;
  supportedReasoningEfforts?: unknown;
  inputModalities?: unknown;
  supportsPersonality?: unknown;
  isDefault?: unknown;
};

type CodexThreadWire = {
  id?: unknown;
  name?: unknown;
  preview?: unknown;
  ephemeral?: unknown;
  modelProvider?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  status?: unknown;
};

type ThreadResponseWire = {
  thread?: CodexThreadWire;
};

type SteerTurnResponseWire = {
  turnId?: unknown;
};

@Injectable()
export class CodexService {
  constructor(
    @Inject(CodexAppServerRpcClient)
    private readonly rpcClient: CodexAppServerRpcClient,
  ) {}

  async listModels(input: ListCodexModelsInput): Promise<ListCodexModelsResult> {
    const result = await this.rpcClient.request<CodexPage<CodexModelWire>>('model/list', {
      limit: input.limit,
      cursor: input.cursor ?? null,
      includeHidden: input.includeHidden ?? false,
    });

    return {
      models: (result.data ?? []).map(mapModel),
      nextCursor: normalizeNullableString(result.nextCursor),
    };
  }

  async listThreads(input: ListCodexThreadsInput): Promise<ListCodexThreadsResult> {
    const result = await this.rpcClient.request<CodexPage<CodexThreadWire>>('thread/list', {
      limit: input.limit,
      cursor: input.cursor ?? null,
      sortKey: input.sortKey,
      archived: input.archived,
      cwd: input.cwd,
      searchTerm: input.searchTerm,
      sourceKinds: input.sourceKinds,
      modelProviders: input.modelProviders,
    });

    return {
      threads: (result.data ?? []).map(mapThread),
      nextCursor: normalizeNullableString(result.nextCursor),
    };
  }

  async startThread(input: StartCodexThreadInput): Promise<StartCodexThreadResult> {
    const result = await this.rpcClient.request<ThreadResponseWire>('thread/start', {
      model: input.model,
      cwd: input.cwd,
      approvalPolicy: input.approvalPolicy,
      sandbox: input.sandbox,
      personality: input.personality,
      serviceName: input.serviceName ?? 'codex_symphony_demo',
    });

    if (!result.thread) {
      throw new Error('Codex app-server did not return a thread.');
    }

    return {
      thread: mapThread(result.thread),
    };
  }

  async *sendThreadMessage(
    input: SendCodexThreadMessageInput,
  ): AsyncIterable<CodexThreadMessageStreamEventResult> {
    for await (const event of this.rpcClient.streamTurn({
      threadId: input.threadId,
      input: mapMessageInput(input),
      model: input.model,
      cwd: input.cwd,
      approvalPolicy: input.approvalPolicy,
      sandboxPolicy: input.sandboxPolicy,
      effort: input.effort,
      summary: input.summary,
      personality: input.personality,
      resume: input.resume,
    })) {
      if (event.type === 'turn_response') {
        yield {
          event: 'turn_response',
          method: null,
          payload: event.result,
        };
        continue;
      }

      yield {
        event: 'notification',
        method: event.method,
        payload: event.params,
      };
    }
  }

  async steerTurn(input: SteerCodexTurnInput): Promise<SteerCodexTurnResult> {
    const result = await this.rpcClient.steerTurn<SteerTurnResponseWire>({
      threadId: input.threadId,
      expectedTurnId: input.turnId,
      input: mapMessageInput(input),
    });

    return {
      turnId: normalizeRequiredString(result.turnId, 'turn.turnId'),
    };
  }
}

function mapMessageInput(input: {
  message: string;
  mentions?: Array<{ name: string; path: string }>;
  skills?: CodexSkillInput[];
  localImages?: CodexLocalImageInput[];
}): CodexAppServerInputItem[] {
  return [
    { type: 'text', text: input.message },
    ...(input.mentions ?? []).map((mention) => ({
      type: 'mention',
      name: mention.name,
      path: mention.path,
    })),
    ...(input.skills ?? []).map((skill) => ({
      type: 'skill',
      name: skill.name,
      path: skill.path,
    })),
    ...(input.localImages ?? []).map((image) => ({
      type: 'localImage',
      path: image.path,
    })),
  ];
}

function mapModel(model: CodexModelWire): CodexModelResult {
  return {
    id: normalizeRequiredString(model.id, 'model.id'),
    model: normalizeRequiredString(model.model, 'model.model'),
    displayName: normalizeNullableString(model.displayName),
    hidden: normalizeBoolean(model.hidden, false),
    defaultReasoningEffort: normalizeNullableString(model.defaultReasoningEffort),
    supportedReasoningEfforts: Array.isArray(model.supportedReasoningEfforts)
      ? model.supportedReasoningEfforts.map((effort) => ({
          reasoningEffort: normalizeRequiredString(
            (effort as { reasoningEffort?: unknown }).reasoningEffort,
            'model.supportedReasoningEfforts.reasoningEffort',
          ),
          description: normalizeNullableString((effort as { description?: unknown }).description),
        }))
      : [],
    inputModalities: normalizeStringArray(model.inputModalities, ['text', 'image']),
    supportsPersonality: normalizeNullableBoolean(model.supportsPersonality),
    isDefault: normalizeBoolean(model.isDefault, false),
  };
}

function mapThread(thread: CodexThreadWire): CodexThreadResult {
  return {
    id: normalizeRequiredString(thread.id, 'thread.id'),
    name: normalizeNullableString(thread.name),
    preview: normalizeNullableString(thread.preview),
    ephemeral: normalizeBoolean(thread.ephemeral, false),
    modelProvider: normalizeNullableString(thread.modelProvider),
    createdAt: parseCodexTimestamp(thread.createdAt),
    updatedAt: parseCodexTimestamp(thread.updatedAt),
    status: mapThreadStatus(thread.status),
  };
}

function mapThreadStatus(status: unknown): CodexThreadResult['status'] {
  if (!status || typeof status !== 'object') {
    return null;
  }

  const typedStatus = status as { type?: unknown; activeFlags?: unknown };

  return {
    type: normalizeRequiredString(typedStatus.type, 'thread.status.type'),
    activeFlags: normalizeStringArray(typedStatus.activeFlags, []),
  };
}

function normalizeRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Codex app-server returned invalid ${field}.`);
  }

  return value;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function normalizeBoolean(value: unknown, defaultValue: boolean): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

function normalizeNullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeStringArray(value: unknown, defaultValue: string[]): string[] {
  if (!Array.isArray(value)) {
    return defaultValue;
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function parseCodexTimestamp(value: unknown): Date | null {
  if (typeof value === 'number') {
    return new Date(value * 1000);
  }

  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
}
