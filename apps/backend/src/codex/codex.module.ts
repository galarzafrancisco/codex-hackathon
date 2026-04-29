import { Module } from '@nestjs/common';
import { CodexAppServerProcessService } from './codex-app-server-process.service';
import { CodexAppServerRpcClient } from './codex-app-server-rpc.client';
import { CodexController } from './codex.controller';
import { CodexService } from './codex.service';

@Module({
  controllers: [CodexController],
  providers: [CodexAppServerProcessService, CodexAppServerRpcClient, CodexService],
  exports: [CodexService],
})
export class CodexModule {}
