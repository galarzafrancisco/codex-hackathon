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
