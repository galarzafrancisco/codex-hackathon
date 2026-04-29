import WebSocket from 'ws';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CodexAppServerProcessService } from './codex-app-server-process.service';

type JsonObject = Record<string, unknown>;

type JsonRpcResponse = {
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export type CodexAppServerInputItem = JsonObject;

export type CodexAppServerStreamEvent =
  | {
      type: 'turn_response';
      result: unknown;
    }
  | {
      type: 'notification';
      method: string;
      params: unknown;
    };

export type CodexAppServerStartTurnInput = {
  threadId: string;
  input: CodexAppServerInputItem[];
  model?: string;
  cwd?: string;
  approvalPolicy?: string;
  sandboxPolicy?: JsonObject;
  effort?: string;
  summary?: string;
  personality?: string;
  resume?: boolean;
};

export type CodexAppServerSteerTurnInput = {
  threadId: string;
  expectedTurnId: string;
  input: CodexAppServerInputItem[];
};

const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class CodexAppServerRpcClient {
  private readonly logger = new Logger(CodexAppServerRpcClient.name);
  private nextId = 1;

  constructor(
    @Inject(CodexAppServerProcessService)
    private readonly processService: CodexAppServerProcessService,
  ) {}

  async request<TResponse>(method: string, params?: JsonObject): Promise<TResponse> {
    const webSocketUrl = await this.processService.getWebSocketUrl();
    const socket = await this.openInitializedSocket(webSocketUrl);

    try {
      return await this.sendRequest<TResponse>(socket, method, params);
    } finally {
      socket.close();
    }
  }

  async *streamTurn(input: CodexAppServerStartTurnInput): AsyncIterable<CodexAppServerStreamEvent> {
    const webSocketUrl = await this.processService.getWebSocketUrl();
    const socket = await this.openInitializedSocket(webSocketUrl);
    const events = new AsyncEventQueue<CodexAppServerStreamEvent>();
    let completed = false;
    let closedByClient = false;

    const onMessage = (rawMessage: WebSocket.RawData) => {
      let message: unknown;

      try {
        message = JSON.parse(rawMessage.toString());
      } catch (error) {
        this.logger.warn(`Ignored invalid Codex app-server message: ${(error as Error).message}`);
        return;
      }

      if (!message || typeof message !== 'object') {
        return;
      }

      const notification = message as { method?: unknown; params?: unknown; id?: unknown };

      if (notification.id !== undefined || typeof notification.method !== 'string') {
        return;
      }

      events.push({
        type: 'notification',
        method: notification.method,
        params: notification.params ?? null,
      });

      if (notification.method === 'turn/completed') {
        completed = true;
        events.end();
      }
    };

    const onError = (error: Error) => {
      events.fail(error);
    };

    const onClose = () => {
      if (!completed && !closedByClient) {
        events.fail(new Error('Codex app-server connection closed before the turn completed.'));
      }
    };

    socket.on('message', onMessage);
    socket.once('error', onError);
    socket.once('close', onClose);

    try {
      if (input.resume !== false) {
        await this.sendRequest(socket, 'thread/resume', {
          threadId: input.threadId,
          model: input.model,
          cwd: input.cwd,
          approvalPolicy: input.approvalPolicy,
          personality: input.personality,
        });
      }

      const result = await this.sendRequest(socket, 'turn/start', {
        threadId: input.threadId,
        input: input.input,
        model: input.model,
        cwd: input.cwd,
        approvalPolicy: input.approvalPolicy,
        sandboxPolicy: input.sandboxPolicy,
        effort: input.effort,
        summary: input.summary,
        personality: input.personality,
      });

      events.push({ type: 'turn_response', result });

      for await (const event of events) {
        yield event;
      }
    } finally {
      closedByClient = true;
      socket.off('message', onMessage);
      socket.off('error', onError);
      socket.off('close', onClose);
      socket.close();
    }
  }

  async steerTurn<TResponse>(input: CodexAppServerSteerTurnInput): Promise<TResponse> {
    return this.request<TResponse>('turn/steer', {
      threadId: input.threadId,
      expectedTurnId: input.expectedTurnId,
      input: input.input,
    });
  }

  private async openInitializedSocket(webSocketUrl: string): Promise<WebSocket> {
    const token = process.env.CODEX_APP_SERVER_AUTH_TOKEN?.trim();
    const socket = new WebSocket(webSocketUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out connecting to Codex app-server at ${webSocketUrl}.`));
      }, REQUEST_TIMEOUT_MS);

      socket.once('open', () => {
        clearTimeout(timer);
        resolve();
      });

      socket.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });

    await this.sendRequest(socket, 'initialize', {
      clientInfo: {
        name: 'codex_symphony_demo_backend',
        title: 'Codex Symphony Demo Backend',
        version: '0.1.0',
      },
    });
    socket.send(JSON.stringify({ method: 'initialized', params: {} }));

    return socket;
  }

  private async sendRequest<TResponse>(
    socket: WebSocket,
    method: string,
    params?: JsonObject,
  ): Promise<TResponse> {
    const id = this.nextId++;
    const message = params === undefined ? { id, method } : { id, method, params };

    return new Promise<TResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Codex app-server request ${method} timed out.`));
      }, REQUEST_TIMEOUT_MS);

      const onMessage = (rawMessage: WebSocket.RawData) => {
        let response: JsonRpcResponse | null = null;

        try {
          response = JSON.parse(rawMessage.toString()) as JsonRpcResponse;
        } catch (error) {
          this.logger.warn(`Ignored invalid Codex app-server message: ${(error as Error).message}`);
          return;
        }

        if (response.id !== id) {
          return;
        }

        cleanup();

        if (response.error) {
          reject(new Error(`Codex app-server ${method} failed: ${response.error.message}`));
          return;
        }

        resolve(response.result as TResponse);
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const onClose = () => {
        cleanup();
        reject(new Error(`Codex app-server connection closed during ${method}.`));
      };

      const cleanup = () => {
        clearTimeout(timer);
        socket.off('message', onMessage);
        socket.off('error', onError);
        socket.off('close', onClose);
      };

      socket.on('message', onMessage);
      socket.once('error', onError);
      socket.once('close', onClose);
      socket.send(JSON.stringify(message));
    });
  }
}

class AsyncEventQueue<T> implements AsyncIterable<T> {
  private readonly values: T[] = [];
  private readonly waiters: Array<(result: IteratorResult<T>) => void> = [];
  private readonly errorWaiters: Array<(error: Error) => void> = [];
  private done = false;
  private error: Error | null = null;

  push(value: T): void {
    if (this.done || this.error) {
      return;
    }

    const waiter = this.waiters.shift();
    const errorWaiter = this.errorWaiters.shift();

    if (waiter && errorWaiter) {
      waiter({ value, done: false });
      return;
    }

    this.values.push(value);
  }

  end(): void {
    if (this.done || this.error) {
      return;
    }

    this.done = true;
    this.resolveWaiters({ value: undefined, done: true });
  }

  fail(error: Error): void {
    if (this.done || this.error) {
      return;
    }

    this.error = error;
    while (this.errorWaiters.length > 0) {
      const reject = this.errorWaiters.shift();
      this.waiters.shift();
      reject?.(error);
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => this.next(),
    };
  }

  private next(): Promise<IteratorResult<T>> {
    if (this.values.length > 0) {
      return Promise.resolve({ value: this.values.shift() as T, done: false });
    }

    if (this.error) {
      return Promise.reject(this.error);
    }

    if (this.done) {
      return Promise.resolve({ value: undefined, done: true });
    }

    return new Promise<IteratorResult<T>>((resolve, reject) => {
      this.waiters.push(resolve);
      this.errorWaiters.push(reject);
    });
  }

  private resolveWaiters(result: IteratorResult<T>): void {
    while (this.waiters.length > 0) {
      const resolve = this.waiters.shift();
      this.errorWaiters.shift();
      resolve?.(result);
    }
  }
}
