import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateIssueRequestDto } from './dto/create-issue-request.dto';
import { IssueIdParamDto } from './dto/issue-id-param.dto';
import { IssueBlockerRefRequestDto } from './dto/issue-blocker-ref-request.dto';
import { IssueBlockerRefResponseDto } from './dto/issue-blocker-ref-response.dto';
import { IssueResponseDto } from './dto/issue-response.dto';
import { ListIssuesResponseDto } from './dto/list-issues-response.dto';
import type {
  CreateIssueInput,
  IssueBlockerRefInput,
  IssueBlockerRefResult,
  IssueResult,
  UpsertIssueInput,
} from './dto/service/issue.service.types';
import { UpsertIssueRequestDto } from './dto/upsert-issue-request.dto';
import { IssuesService } from './issues.service';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(
    @Inject(IssuesService)
    private readonly issuesService: IssuesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List normalized issues' })
  @ApiOkResponse({
    description: 'Issues sorted for dispatch.',
    type: ListIssuesResponseDto,
  })
  async listIssues(): Promise<ListIssuesResponseDto> {
    const issues = await this.issuesService.listIssues();

    return {
      issues: issues.map(mapIssueResultToResponse),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read a normalized issue' })
  @ApiParam({
    name: 'id',
    description: 'Stable tracker-internal issue ID.',
    example: 'issue_01HZY8Z3P8M5N7R1E2A4C6D9F0',
    type: String,
  })
  @ApiOkResponse({
    description: 'The normalized issue record.',
    type: IssueResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No issue exists for the requested tracker-internal ID.',
  })
  async getIssue(@Param() params: IssueIdParamDto): Promise<IssueResponseDto> {
    const issue = await this.issuesService.findIssueById(params.id);

    if (!issue) {
      throw new NotFoundException(`Issue ${params.id} was not found.`);
    }

    return mapIssueResultToResponse(issue);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tracker issue' })
  @ApiBody({
    description: 'Issue fields to create.',
    type: CreateIssueRequestDto,
  })
  @ApiCreatedResponse({
    description: 'The issue was created.',
    type: IssueResponseDto,
  })
  async createIssue(@Body() request: CreateIssueRequestDto): Promise<IssueResponseDto> {
    const issue = await this.issuesService.createIssue(mapIssueRequestToCreateInput(request));

    return mapIssueResultToResponse(issue);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create or replace a normalized issue' })
  @ApiParam({
    name: 'id',
    description: 'Stable tracker-internal issue ID.',
    example: 'issue_01HZY8Z3P8M5N7R1E2A4C6D9F0',
    type: String,
  })
  @ApiBody({
    description: 'Normalized issue record fields to create or replace.',
    type: UpsertIssueRequestDto,
  })
  @ApiOkResponse({
    description: 'The normalized issue record was stored.',
    type: IssueResponseDto,
  })
  async upsertIssue(
    @Param() params: IssueIdParamDto,
    @Body() request: UpsertIssueRequestDto,
  ): Promise<IssueResponseDto> {
    const issue = await this.issuesService.upsertIssue(
      mapIssueRequestToUpsertInput(params.id, request),
    );

    return mapIssueResultToResponse(issue);
  }
}

function mapIssueRequestToCreateInput(request: CreateIssueRequestDto): CreateIssueInput {
  return {
    identifier: request.identifier,
    title: request.title,
    description: request.description,
    priority: request.priority,
    state: request.state,
    branchName: request.branch_name,
    url: request.url,
    labels: request.labels,
    blockedBy: request.blocked_by?.map(mapBlockerRequestToServiceInput),
  };
}

function mapIssueRequestToUpsertInput(
  id: string,
  request: UpsertIssueRequestDto,
): UpsertIssueInput {
  return {
    id,
    ...mapIssueRequestToCreateInput(request),
  };
}

function mapBlockerRequestToServiceInput(
  blocker: IssueBlockerRefRequestDto,
): IssueBlockerRefInput {
  return {
    id: blocker.id ?? null,
    identifier: blocker.identifier ?? null,
    state: blocker.state ?? null,
    createdAt: parseOptionalDate(blocker.created_at),
    updatedAt: parseOptionalDate(blocker.updated_at),
  };
}

function mapIssueResultToResponse(issue: IssueResult): IssueResponseDto {
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    state: issue.state,
    branch_name: issue.branchName,
    url: issue.url,
    labels: issue.labels,
    blocked_by: issue.blockedBy.map(mapBlockerResultToResponse),
  };
}

function mapBlockerResultToResponse(
  blocker: IssueBlockerRefResult,
): IssueBlockerRefResponseDto {
  return {
    id: blocker.id,
    identifier: blocker.identifier,
    state: blocker.state,
    created_at: blocker.createdAt?.toISOString() ?? null,
    updated_at: blocker.updatedAt?.toISOString() ?? null,
  };
}

function parseOptionalDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}
