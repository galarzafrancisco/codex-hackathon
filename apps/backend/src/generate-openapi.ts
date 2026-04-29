import 'reflect-metadata';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { createOpenApiDocument } from './openapi';

async function generateOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);

  const document = createOpenApiDocument(app);
  const outputPath = resolve(process.cwd(), 'openapi.json');

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();

  console.log(`OpenAPI spec written to ${outputPath}`);
}

generateOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
