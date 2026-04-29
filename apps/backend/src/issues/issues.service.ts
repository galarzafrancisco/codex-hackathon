import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  CreateIssueInput,
  IssueBlockerRefInput,
  IssueBlockerRefResult,
  IssueResult,
  UpsertIssueInput,
} from './dto/service/issue.service.types';
import { IssueEntity, type IssueBlockerRefEntityValue } from './entities/issue.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(IssueEntity)
    private readonly issuesRepository: Repository<IssueEntity>,
  ) {}

  async listIssues(): Promise<IssueResult[]> {
    const issues = await this.issuesRepository
      .createQueryBuilder('issue')
      .orderBy('issue.priority IS NULL', 'ASC')
      .addOrderBy('issue.priority', 'ASC')
      .addOrderBy('issue.identifier', 'ASC')
      .getMany();

    return issues.map(mapIssueEntityToResult);
  }

  async findIssueById(id: string): Promise<IssueResult | null> {
    const issue = await this.issuesRepository.findOneBy({ id });

    if (!issue) {
      return null;
    }

    return mapIssueEntityToResult(issue);
  }

  async createIssue(input: CreateIssueInput): Promise<IssueResult> {
    const issue = this.issuesRepository.create(
      mapIssueInputToEntity({
        id: `issue_${randomUUID()}`,
        ...input,
      }),
    );

    const savedIssue = await this.issuesRepository.save(issue);
    return mapIssueEntityToResult(savedIssue);
  }

  async upsertIssue(input: UpsertIssueInput): Promise<IssueResult> {
    const existingIssue = await this.issuesRepository.findOneBy({ id: input.id });
    const issue = this.issuesRepository.create({
      ...existingIssue,
      ...mapIssueInputToEntity(input),
    });

    const savedIssue = await this.issuesRepository.save(issue);
    return mapIssueEntityToResult(savedIssue);
  }
}

function mapIssueEntityToResult(issue: IssueEntity): IssueResult {
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    state: issue.state,
    branchName: issue.branchName,
    url: issue.url,
    labels: [...issue.labels],
    blockedBy: issue.blockedBy.map(mapStoredBlockerToResult),
  };
}

function mapIssueInputToEntity(input: UpsertIssueInput): Partial<IssueEntity> {
  return {
    id: normalizeRequiredString(input.id),
    identifier: normalizeRequiredString(input.identifier),
    title: normalizeRequiredString(input.title),
    description: normalizeNullableString(input.description),
    priority: input.priority ?? null,
    state: normalizeRequiredString(input.state),
    branchName: normalizeNullableString(input.branchName),
    url: normalizeNullableString(input.url),
    labels: normalizeLabels(input.labels ?? []),
    blockedBy: normalizeBlockersForStorage(input.blockedBy ?? []),
  };
}

function mapStoredBlockerToResult(blocker: IssueBlockerRefEntityValue): IssueBlockerRefResult {
  return {
    id: normalizeNullableString(blocker.id),
    identifier: normalizeNullableString(blocker.identifier),
    state: normalizeNullableString(blocker.state),
    createdAt: parseStoredDate(blocker.created_at),
    updatedAt: parseStoredDate(blocker.updated_at),
  };
}

function normalizeBlockersForStorage(
  blockers: IssueBlockerRefInput[],
): IssueBlockerRefEntityValue[] {
  return blockers.map((blocker) => ({
    id: normalizeNullableString(blocker.id),
    identifier: normalizeNullableString(blocker.identifier),
    state: normalizeNullableString(blocker.state),
    created_at: blocker.createdAt?.toISOString() ?? null,
    updated_at: blocker.updatedAt?.toISOString() ?? null,
  }));
}

function normalizeLabels(labels: string[]): string[] {
  const normalizedLabels = new Set<string>();

  for (const label of labels) {
    const normalizedLabel = label.trim().toLowerCase();

    if (normalizedLabel.length > 0) {
      normalizedLabels.add(normalizedLabel);
    }
  }

  return [...normalizedLabels];
}

function normalizeRequiredString(value: string): string {
  return value.trim();
}

function normalizeNullableString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function parseStoredDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}
