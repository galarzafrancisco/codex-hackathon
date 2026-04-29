import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CreateIssuesTable1777392000000 } from './migrations/1777392000000-CreateIssuesTable';

const DEFAULT_DATABASE_PATH = 'data/database.sqlite';

export function getDatabasePath(): string {
  const configuredPath = process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH;

  if (isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return resolve(process.env.INIT_CWD ?? process.cwd(), configuredPath);
}

export function getTypeOrmModuleOptions(): TypeOrmModuleOptions {
  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });

  return {
    type: 'sqlite',
    database: databasePath,
    autoLoadEntities: true,
    migrations: [CreateIssuesTable1777392000000],
    migrationsRun: true,
    synchronize: false,
  };
}
