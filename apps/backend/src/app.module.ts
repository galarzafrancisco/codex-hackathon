import { Module } from '@nestjs/common';
import { CodexModule } from './codex/codex.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [CodexModule, DatabaseModule, IssuesModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
