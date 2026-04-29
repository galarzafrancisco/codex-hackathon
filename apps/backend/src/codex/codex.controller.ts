import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CodexModelResponseDto } from './dto/codex-model-response.dto';
import { CodexThreadIdParamDto } from './dto/codex-thread-id-param.dto';
import { CodexThreadResponseDto } from './dto/codex-thread-response.dto';
import { CodexThreadTurnParamDto } from './dto/codex-thread-turn-param.dto';
import { ListCodexModelsQueryDto } from './dto/list-codex-models-query.dto';
import { ListCodexModelsResponseDto } from './dto/list-codex-models-response.dto';
import { ListCodexThreadsQueryDto } from './dto/list-codex-threads-query.dto';
import { ListCodexThreadsResponseDto } from './dto/list-codex-threads-response.dto';
import type {
  CodexModelResult,
  CodexThreadResult,
} from './dto/service/codex.service.types';
import { SendCodexThreadMessageQueryDto } from './dto/send-codex-thread-message-query.dto';
import { SendCodexThreadMessageRequestDto } from './dto/send-codex-thread-message-request.dto';
import { SteerCodexTurnRequestDto } from './dto/steer-codex-turn-request.dto';
import { StartCodexThreadRequestDto } from './dto/start-codex-thread-request.dto';
import { StartCodexThreadResponseDto } from './dto/start-codex-thread-response.dto';
import { SteerCodexTurnResponseDto } from './dto/steer-codex-turn-response.dto';
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

  @Get('threads/:thread_id/messages/stream')
  @ApiOperation({
    summary: 'Send a Codex thread message and stream app-server events',
    description:
      'Starts a turn with the supplied user message. The response body is Server-Sent Events; each data frame has event, method, and payload fields.',
  })
  @ApiParam({
    name: 'thread_id',
    description: 'Stable Codex thread identifier.',
    type: String,
  })
  @ApiQuery({
    name: 'message',
    description: 'User text to send to Codex as the next turn input.',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'mention_name',
    description: 'App connector mention names. Pair by index with mention_path.',
    required: false,
    isArray: true,
    type: String,
  })
  @ApiQuery({
    name: 'mention_path',
    description: 'Codex app-server mention paths. Pair by index with mention_name.',
    required: false,
    isArray: true,
    type: String,
  })
  @ApiQuery({
    name: 'skill_name',
    description: 'Skill names. Pair by index with skill_path.',
    required: false,
    isArray: true,
    type: String,
  })
  @ApiQuery({
    name: 'skill_path',
    description: 'Absolute skill paths. Pair by index with skill_name.',
    required: false,
    isArray: true,
    type: String,
  })
  @ApiQuery({
    name: 'local_image_path',
    description: 'Absolute local image paths to include with the turn.',
    required: false,
    isArray: true,
    type: String,
  })
  @ApiQuery({
    name: 'model',
    description: 'Model override for this and later turns on the thread.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'cwd',
    description: 'Working directory override for this and later turns on the thread.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'approval_policy',
    description: 'Approval policy override for this turn.',
    enum: ['untrusted', 'on-request', 'never'],
    required: false,
  })
  @ApiQuery({
    name: 'sandbox_policy_json',
    description: 'JSON-encoded sandbox policy object to pass through to Codex app-server turn/start.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'effort',
    description: 'Reasoning effort override for this and later turns on the thread.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'summary',
    description: 'Reasoning summary override for this and later turns on the thread.',
    enum: ['auto', 'concise', 'detailed', 'none'],
    required: false,
  })
  @ApiQuery({
    name: 'personality',
    description: 'Codex personality override for this and later turns on the thread.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'resume',
    description: 'Resume and subscribe to the thread before starting the turn.',
    required: false,
    type: Boolean,
  })
  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    description: 'SSE stream of Codex app-server turn response and notification events.',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example:
            'data: {"event":"notification","method":"item/agentMessage/delta","payload":{"text":"Hello"}}\\n\\n',
        },
      },
    },
  })
  async sendThreadMessage(
    @Param() params: CodexThreadIdParamDto,
    @Query() query: SendCodexThreadMessageQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    response.status(200);
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders?.();

    let closed = false;
    response.on('close', () => {
      closed = true;
    });

    try {
      for await (const event of this.codexService.sendThreadMessage({
        threadId: params.thread_id,
        message: query.message,
        mentions: pairNamedPaths(query.mention_name, query.mention_path),
        skills: pairNamedPaths(query.skill_name, query.skill_path),
        localImages: (query.local_image_path ?? []).map((path) => ({ path })),
        model: query.model,
        cwd: query.cwd,
        approvalPolicy: query.approval_policy,
        sandboxPolicy: parseSandboxPolicy(query.sandbox_policy_json),
        effort: query.effort,
        summary: query.summary,
        personality: query.personality,
        resume: query.resume,
      })) {
        if (closed) {
          break;
        }

        writeSse(response, event);
      }
    } catch (error) {
      if (!closed) {
        writeSse(response, {
          event: 'error',
          method: null,
          payload: { message: (error as Error).message },
        });
      }
    } finally {
      if (!closed) {
        response.end();
      }
    }
  }

  @Post('threads/:thread_id/turns/:turn_id/steer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Append user input to an active Codex turn' })
  @ApiParam({
    name: 'thread_id',
    description: 'Stable Codex thread identifier.',
    type: String,
  })
  @ApiParam({
    name: 'turn_id',
    description: 'Expected active Codex turn identifier.',
    type: String,
  })
  @ApiBody({
    description: 'Additional user input to append to the active turn.',
    type: SteerCodexTurnRequestDto,
  })
  @ApiOkResponse({
    description: 'The active turn accepted the steering input.',
    type: SteerCodexTurnResponseDto,
  })
  async steerTurn(
    @Param() params: CodexThreadTurnParamDto,
    @Body() request: SteerCodexTurnRequestDto,
  ): Promise<SteerCodexTurnResponseDto> {
    const result = await this.codexService.steerTurn({
      threadId: params.thread_id,
      turnId: params.turn_id,
      message: request.message,
      mentions: request.mentions,
      skills: request.skills,
      localImages: request.local_images,
    });

    return {
      turn_id: result.turnId,
    };
  }
}

function writeSse(response: Response, event: unknown): void {
  response.write(`data: ${JSON.stringify(event)}\n\n`);
}

function pairNamedPaths(
  names: string[] | undefined,
  paths: string[] | undefined,
): Array<{ name: string; path: string }> {
  const safeNames = names ?? [];
  const safePaths = paths ?? [];

  return safeNames
    .map((name, index) => ({ name, path: safePaths[index] }))
    .filter((item): item is { name: string; path: string } => typeof item.path === 'string');
}

function parseSandboxPolicy(value: string | undefined): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = JSON.parse(value) as unknown;

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('sandbox_policy_json must be a JSON object.');
  }

  return parsed as Record<string, unknown>;
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
