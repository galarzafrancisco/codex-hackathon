import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../api/client';
import type { CreateIssueRequestDto, IssueResponseDto, UpsertIssueRequestDto } from '../../api/client';

export type IssueBoardStatus = 'not_started' | 'in_progress' | 'for_review' | 'done';

export interface NewIssueForm {
  title: string;
  description: string;
  labels: string;
  priority: string;
  branchName: string;
  status: IssueBoardStatus;
}

const initialNewIssueForm: NewIssueForm = {
  title: '',
  description: '',
  labels: '',
  priority: '',
  branchName: '',
  status: 'not_started',
};

export function useIssuesBoard() {
  const [issues, setIssues] = useState<IssueResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);

  const loadIssues = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.issues.IssuesController_listIssues({ signal });
      setIssues(response.issues);
    } catch (cause) {
      if (signal?.aborted) {
        return;
      }

      setError(getErrorMessage(cause));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadIssues(controller.signal);

    return () => controller.abort();
  }, [loadIssues]);

  const createIssue = useCallback(async (form: NewIssueForm) => {
    setIsCreating(true);
    setError(null);

    try {
      const body: CreateIssueRequestDto = {
        identifier: createIssueIdentifier(form.title),
        title: form.title.trim(),
        description: normalizeOptionalString(form.description),
        state: form.status,
        labels: parseLabels(form.labels),
        priority: parsePriority(form.priority),
        branch_name: normalizeOptionalString(form.branchName),
      };
      const issue = await apiClient.issues.IssuesController_createIssue({ body });
      setIssues((currentIssues) => [...currentIssues, issue]);
      return issue;
    } catch (cause) {
      setError(getErrorMessage(cause));
      throw cause;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateIssueStatus = useCallback(async (issue: IssueResponseDto, state: IssueBoardStatus) => {
    if (normalizeStatus(issue.state) === state) {
      return;
    }

    setUpdatingIssueId(issue.id);
    setError(null);

    try {
      const body: UpsertIssueRequestDto = {
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        state,
        branch_name: issue.branch_name,
        url: issue.url,
        labels: issue.labels,
        blocked_by: issue.blocked_by,
      };
      const updatedIssue = await apiClient.issues.IssuesController_upsertIssue({
        id: issue.id,
        body,
      });
      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) => (currentIssue.id === updatedIssue.id ? updatedIssue : currentIssue)),
      );
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setUpdatingIssueId(null);
    }
  }, []);

  const sortedIssues = useMemo(
    () =>
      [...issues].sort((left, right) => {
        const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
        const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return left.identifier.localeCompare(right.identifier);
      }),
    [issues],
  );

  return {
    createIssue,
    error,
    initialNewIssueForm,
    isCreating,
    isLoading,
    issues: sortedIssues,
    reloadIssues: loadIssues,
    updateIssueStatus,
    updatingIssueId,
  };
}

export function normalizeStatus(state: string): IssueBoardStatus {
  const normalizedState = state.trim().toLowerCase().replaceAll(' ', '_').replaceAll('-', '_');

  if (
    normalizedState === 'in_progress' ||
    normalizedState === 'for_review' ||
    normalizedState === 'done' ||
    normalizedState === 'not_started'
  ) {
    return normalizedState;
  }

  return 'not_started';
}

function parseLabels(value: string): string[] {
  return value
    .split(',')
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
}

function parsePriority(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalString(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function createIssueIdentifier(title: string): string {
  const slug = title
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12);
  const timestamp = Date.now().toString(36).toUpperCase();

  return `${slug || 'ISSUE'}-${timestamp}`;
}

function getErrorMessage(cause: unknown): string {
  if (cause instanceof Error) {
    return cause.message;
  }

  return 'The issues service returned an unexpected response.';
}
