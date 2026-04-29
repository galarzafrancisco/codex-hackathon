import { ValidationPipe, type INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api/v1';

export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
}
