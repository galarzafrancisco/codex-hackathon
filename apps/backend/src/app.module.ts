import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [DatabaseModule, IssuesModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
