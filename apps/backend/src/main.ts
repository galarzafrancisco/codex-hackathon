import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { OPENAPI_DOCS_PATH, setupOpenApi } from './openapi';

const DEFAULT_BACKEND_PORT = 2001;

function getBackendPort(): number {
  const rawPort = process.env.BACKEND_PORT ?? String(DEFAULT_BACKEND_PORT);
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`BACKEND_PORT must be an integer between 1 and 65535. Received: ${rawPort}`);
  }

  return port;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  setupOpenApi(app);

  const port = getBackendPort();
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Backend listening on http://localhost:${port}`);
  logger.log(`OpenAPI docs available at http://localhost:${port}/${OPENAPI_DOCS_PATH}`);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
