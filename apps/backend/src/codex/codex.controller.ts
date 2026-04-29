import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CodexModelResponseDto } from './dto/codex-model-response.dto';
import { CodexThreadResponseDto } from './dto/codex-thread-response.dto';
import { ListCodexModelsQueryDto } from './dto/list-codex-models-query.dto';
import { ListCodexModelsResponseDto } from './dto/list-codex-models-response.dto';
import { ListCodexThreadsQueryDto } from './dto/list-codex-threads-query.dto';
import { ListCodexThreadsResponseDto } from './dto/list-codex-threads-response.dto';
import type {
  CodexModelResult,
  CodexThreadResult,
} from './dto/service/codex.service.types';
import { StartCodexThreadRequestDto } from './dto/start-codex-thread-request.dto';
import { StartCodexThreadResponseDto } from './dto/start-codex-thread-response.dto';
import { CodexService } from './codex.service';

@ApiTags('codex')
@Controller('codex')
export class CodexController {
  constructor(
    @Inject(CodexService)
    private readonly codexService: CodexService,
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'List Codex app-server models' })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of models to return.',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'cursor',
    description: 'Opaque pagination cursor returned by Codex app-server.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'include_hidden',
    description: 'Include models Codex marks as hidden from the default picker.',
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({
    description: 'Models available to Codex app-server.',
    type: ListCodexModelsResponseDto,
  })
  async listModels(
    @Query() query: ListCodexModelsQueryDto,
  ): Promise<ListCodexModelsResponseDto> {
    const result = await this.codexService.listModels({
      limit: query.limit,
      cursor: query.cursor ?? null,
      includeHidden: query.include_hidden,
    });

    return {
      models: result.models.map(mapModelResultToResponse),
      next_cursor: result.nextCursor,
    };
  }

  @Get('threads')
  @ApiOperation({ summary: 'List Codex app-server threads' })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of threads to return.',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'cursor',
    description: 'Opaque pagination cursor returned by Codex app-server.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sort_key',
    description: 'Thread sort key.',
    enum: ['created_at', 'updated_at'],
    required: false,
  })
  @ApiQuery({
    name: 'archived',
    description: 'List archived threads instead of active threads.',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'cwd',
    description: 'Restrict results to threads whose current working directory exactly matches this path.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'search_term',
    description: 'Search stored thread summaries and metadata.',
    required: false,
    type: String,
  })
  @ApiOkResponse({
    description: 'Threads returned by Codex app-server.',
    type: ListCodexThreadsResponseDto,
  })
  async listThreads(
    @Query() query: ListCodexThreadsQueryDto,
  ): Promise<ListCodexThreadsResponseDto> {
    const result = await this.codexService.listThreads({
      limit: query.limit,
      cursor: query.cursor ?? null,
      sortKey: query.sort_key,
      archived: query.archived,
      cwd: query.cwd ?? null,
      searchTerm: query.search_term ?? null,
    });

    return {
      threads: result.threads.map(mapThreadResultToResponse),
      next_cursor: result.nextCursor,
    };
  }

  @Post('threads')
  @ApiOperation({ summary: 'Start a new Codex app-server thread' })
  @ApiBody({
    description: 'Options for the new Codex thread.',
    type: StartCodexThreadRequestDto,
  })
  @ApiCreatedResponse({
    description: 'The Codex thread was started.',
    type: StartCodexThreadResponseDto,
  })
  async startThread(
    @Body() request: StartCodexThreadRequestDto,
  ): Promise<StartCodexThreadResponseDto> {
    const result = await this.codexService.startThread({
      model: request.model,
      cwd: request.cwd,
      approvalPolicy: request.approval_policy,
      sandbox: request.sandbox,
      personality: request.personality,
      serviceName: request.service_name,
    });

    return {
      thread: mapThreadResultToResponse(result.thread),
    };
  }
}

function mapModelResultToResponse(model: CodexModelResult): CodexModelResponseDto {
  return {
    id: model.id,
    model: model.model,
    display_name: model.displayName,
    hidden: model.hidden,
    default_reasoning_effort: model.defaultReasoningEffort,
    supported_reasoning_efforts: model.supportedReasoningEfforts.map((effort) => ({
      reasoning_effort: effort.reasoningEffort,
      description: effort.description,
    })),
    input_modalities: model.inputModalities,
    supports_personality: model.supportsPersonality,
    is_default: model.isDefault,
  };
}

function mapThreadResultToResponse(thread: CodexThreadResult): CodexThreadResponseDto {
  return {
    id: thread.id,
    name: thread.name,
    preview: thread.preview,
    ephemeral: thread.ephemeral,
    model_provider: thread.modelProvider,
    created_at: thread.createdAt?.toISOString() ?? null,
    updated_at: thread.updatedAt?.toISOString() ?? null,
    status: thread.status
      ? {
          type: thread.status.type,
          active_flags: thread.status.activeFlags,
        }
      : null,
  };
}
