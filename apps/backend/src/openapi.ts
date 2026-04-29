import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const OPENAPI_DOCS_PATH = 'api/v1/docs';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Codex Symphony Backend')
    .setDescription('Starter backend API for the Codex Symphony monorepo.')
    .setVersion('0.0.1')
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupOpenApi(app: INestApplication): void {
  const document = createOpenApiDocument(app);

  SwaggerModule.setup(OPENAPI_DOCS_PATH, app, document, {
    jsonDocumentUrl: `${OPENAPI_DOCS_PATH}/openapi.json`,
  });
}
