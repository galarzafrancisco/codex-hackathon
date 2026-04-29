import { type ChildProcessByStdio, spawn } from 'node:child_process';
import type { Readable } from 'node:stream';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

const DEFAULT_CODEX_APP_SERVER_URL = 'ws://127.0.0.1:4510';
const READY_TIMEOUT_MS = 10_000;
const READY_POLL_INTERVAL_MS = 150;

@Injectable()
export class CodexAppServerProcessService implements OnModuleDestroy {
  private readonly logger = new Logger(CodexAppServerProcessService.name);
  private process: ChildProcessByStdio<null, Readable, Readable> | null = null;
  private startPromise: Promise<string> | null = null;

  async getWebSocketUrl(): Promise<string> {
    const configuredUrl = process.env.CODEX_APP_SERVER_URL?.trim();

    if (configuredUrl) {
      return configuredUrl;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this.startManagedServer();

    try {
      return await this.startPromise;
    } catch (error) {
      this.startPromise = null;
      throw error;
    }
  }

  onModuleDestroy(): void {
    if (!this.process || this.process.killed) {
      return;
    }

    this.process.kill('SIGTERM');
  }

  private async startManagedServer(): Promise<string> {
    const url = process.env.CODEX_APP_SERVER_MANAGED_URL?.trim() || DEFAULT_CODEX_APP_SERVER_URL;

    if (await this.isReady(url)) {
      return url;
    }

    const command = process.env.CODEX_APP_SERVER_COMMAND?.trim() || 'codex';
    const args = ['app-server', '--listen', url];

    const childProcess = spawn(command, args, {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    this.process = childProcess;

    childProcess.stdout.on('data', (chunk: Buffer) => {
      this.logger.debug(chunk.toString().trim());
    });

    childProcess.stderr.on('data', (chunk: Buffer) => {
      this.logger.warn(chunk.toString().trim());
    });

    childProcess.once('exit', (code, signal) => {
      this.logger.warn(`Codex app-server exited with code ${code ?? 'null'} and signal ${signal ?? 'null'}.`);
      this.process = null;
      this.startPromise = null;
    });

    childProcess.once('error', (error) => {
      this.logger.error(`Failed to start Codex app-server: ${error.message}`);
      this.process = null;
      this.startPromise = null;
    });

    await this.waitUntilReady(url);
    return url;
  }

  private async waitUntilReady(webSocketUrl: string): Promise<void> {
    const readyUrl = new URL(webSocketUrl);
    readyUrl.protocol = readyUrl.protocol === 'wss:' ? 'https:' : 'http:';
    readyUrl.pathname = '/readyz';
    readyUrl.search = '';

    const deadline = Date.now() + READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
      if (this.process?.exitCode !== null) {
        throw new Error('Codex app-server exited before becoming ready.');
      }

      try {
        if (await fetchReady(readyUrl)) {
          return;
        }
      } catch {
        // The listener is still starting.
      }

      await sleep(READY_POLL_INTERVAL_MS);
    }

    throw new Error(`Codex app-server did not become ready at ${readyUrl.toString()}.`);
  }

  private async isReady(webSocketUrl: string): Promise<boolean> {
    const readyUrl = new URL(webSocketUrl);
    readyUrl.protocol = readyUrl.protocol === 'wss:' ? 'https:' : 'http:';
    readyUrl.pathname = '/readyz';
    readyUrl.search = '';

    return fetchReady(readyUrl);
  }
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchReady(url: URL): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}
