import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { IssueResponseDto } from '../../api/client';
import {
  normalizeStatus,
  type IssueBoardStatus,
  type NewIssueForm,
  useIssueDetails,
  useIssuesBoard,
} from './useIssuesBoard';
import './IssueBoard.css';

const columns: Array<{
  status: IssueBoardStatus;
  label: string;
  tone: 'slate' | 'blue' | 'amber' | 'green';
}> = [
  { status: 'not_started', label: 'Not started', tone: 'slate' },
  { status: 'in_progress', label: 'In progress', tone: 'blue' },
  { status: 'for_review', label: 'For review', tone: 'amber' },
  { status: 'done', label: 'Done', tone: 'green' },
];

const priorityOptions = [
  { label: 'Low', value: '1' },
  { label: 'Mid', value: '2' },
  { label: 'High', value: '3' },
];

export function IssueBoard() {
  const {
    createIssue,
    error,
    initialNewIssueForm,
    isCreating,
    isLoading,
    issues,
    reloadIssues,
  } = useIssuesBoard();
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [form, setForm] = useState<NewIssueForm>(initialNewIssueForm);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const issuesByStatus = useMemo(
    () =>
      columns.reduce<Record<IssueBoardStatus, IssueResponseDto[]>>(
        (groupedIssues, column) => {
          groupedIssues[column.status] = issues.filter((issue) => normalizeStatus(issue.state) === column.status);
          return groupedIssues;
        },
        {
          done: [],
          for_review: [],
          in_progress: [],
          not_started: [],
        },
      ),
    [issues],
  );

  useEffect(() => {
    if (!isNewIssueOpen) {
      return;
    }

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isNewIssueOpen]);

  function openNewIssue() {
    setForm(initialNewIssueForm);
    setIsNewIssueOpen(true);
  }

  async function handleCreateIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    await createIssue(form);
    setForm(initialNewIssueForm);
    setIsNewIssueOpen(false);
  }

  return (
    <main className="app-shell">
      <section className="issue-board" aria-label="Issues">
        {error ? (
          <div className="notice" role="alert">
            <span>{error}</span>
            <button className="button button--ghost" type="button" onClick={() => void reloadIssues()}>
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="issue-board__state">Loading issues...</div>
        ) : (
          <div className="issue-board__columns" aria-label="Issue status board">
            {columns.map((column) => (
              <section className="issue-column" aria-labelledby={`${column.status}-title`} key={column.status}>
                <header className="issue-column__header">
                  <span className={`status-indicator status-indicator--${column.tone}`} aria-hidden="true" />
                  <h2 id={`${column.status}-title`}>{column.label}</h2>
                  <span className={`issue-column__count issue-column__count--${column.tone}`}>
                    {issuesByStatus[column.status].length}
                  </span>
                </header>
                {column.status === 'not_started' ? (
                  <button
                    className="button button--ghost issue-column__create"
                    type="button"
                    onClick={() => openNewIssue()}
                  >
                    Create issue
                  </button>
                ) : null}
                <div className="issue-column__cards">
                  {issuesByStatus[column.status].map((issue) => (
                    <IssueCard issue={issue} key={issue.id} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {isNewIssueOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" aria-label="Create issue" onSubmit={(event) => void handleCreateIssue(event)}>
            <div className="modal__header">
              <h2>New issue</h2>
              <button
                aria-label="Close"
                className="icon-button"
                type="button"
                onClick={() => setIsNewIssueOpen(false)}
              >
                <svg viewBox="0 0 24 24" role="img">
                  <path d="m7 7 10 10M17 7 7 17" />
                </svg>
              </button>
            </div>
            <label className="field">
              <span>Title</span>
              <input
                ref={titleInputRef}
                required
                value={form.title}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))}
              />
            </label>
            <fieldset className="field priority-field">
              <legend>Priority</legend>
              <div className="segmented-control" aria-label="Priority">
                {priorityOptions.map((option) => (
                  <button
                    aria-pressed={form.priority === option.value}
                    className="segmented-control__option"
                    key={option.value}
                    type="button"
                    onClick={() => setForm((currentForm) => ({ ...currentForm, priority: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="field">
              <span>Labels</span>
              <input
                placeholder="auth, bug"
                value={form.labels}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, labels: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Branch</span>
              <input
                placeholder="feature/login-redirect"
                value={form.branchName}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, branchName: event.target.value }))}
              />
            </label>
            <div className="modal__footer">
              <button className="button button--ghost" type="button" onClick={() => setIsNewIssueOpen(false)}>
                Cancel
              </button>
              <button className="button button--primary" disabled={isCreating} type="submit">
                {isCreating ? 'Creating...' : 'Create issue'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button className="button button--primary issue-board__fab" type="button" onClick={() => openNewIssue()}>
        New issue
      </button>
    </main>
  );
}

function IssueCard({ issue }: { issue: IssueResponseDto }) {
  return (
    <a className="issue-card issue-card--link" href={`/issues/${issue.id}`}>
      <div className="issue-card__topline">
        <div>
          <h3>{issue.title}</h3>
        </div>
        {normalizeStatus(issue.state) === 'done' ? (
          <span className="done-badge" aria-label="Done">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M7 12.2 10.2 15.4 17.4 7.8" />
            </svg>
          </span>
        ) : null}
      </div>
      {issue.labels.length > 0 ? (
        <div className="issue-card__labels" aria-label="Labels">
          {issue.labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      ) : null}
      {issue.description ? <p className="issue-card__description">{issue.description}</p> : null}
      <div className="issue-card__meta">
        <span className="issue-card__meta-item">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M8 7h8M8 12h5M5 20l3.5-3H18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2" />
          </svg>
          {issue.blocked_by.length}
        </span>
        <span className="issue-card__meta-item">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />
          </svg>
          {issue.priority ? `P${issue.priority}` : 'No priority'}
        </span>
        <span className="issue-card__meta-item issue-card__meta-item--branch">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M6 4v12M18 8a4 4 0 0 1-4 4H6M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          </svg>
          {issue.branch_name ?? 'main'}
        </span>
      </div>
    </a>
  );
}

export function IssueDetails({ issueId }: { issueId: string }) {
  const { error, isLoading, issue, reloadIssue } = useIssueDetails(issueId);

  return (
    <main className="app-shell">
      <section className="issue-detail" aria-labelledby="issue-detail-title">
        <a className="issue-detail__back" href="/">
          Back to issues
        </a>

        {error ? (
          <div className="notice" role="alert">
            <span>{error}</span>
            <button className="button button--ghost" type="button" onClick={() => void reloadIssue()}>
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? <div className="issue-board__state">Loading issue...</div> : null}

        {!isLoading && issue ? (
          <article className="issue-detail__panel">
            <header className="issue-detail__header">
              <div>
                <p className="issue-detail__eyebrow">{issue.identifier}</p>
                <h1 id="issue-detail-title">{issue.title}</h1>
              </div>
              <span className="issue-detail__status">{formatStatus(issue.state)}</span>
            </header>

            {issue.description ? (
              <section className="issue-detail__section" aria-labelledby="issue-description-title">
                <h2 id="issue-description-title">Description</h2>
                <p>{issue.description}</p>
              </section>
            ) : null}

            <dl className="issue-detail__meta">
              <div>
                <dt>Priority</dt>
                <dd>{issue.priority ? `P${issue.priority}` : 'No priority'}</dd>
              </div>
              <div>
                <dt>Branch</dt>
                <dd>{issue.branch_name ?? 'main'}</dd>
              </div>
              <div>
                <dt>Blocked by</dt>
                <dd>{issue.blocked_by.length}</dd>
              </div>
            </dl>

            {issue.url ? (
              <section className="issue-detail__section" aria-labelledby="issue-url-title">
                <h2 id="issue-url-title">URL</h2>
                <a className="issue-detail__link" href={issue.url}>
                  {issue.url}
                </a>
              </section>
            ) : null}

            {issue.labels.length > 0 ? (
              <section className="issue-detail__section" aria-labelledby="issue-labels-title">
                <h2 id="issue-labels-title">Labels</h2>
                <div className="issue-card__labels">
                  {issue.labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </section>
            ) : null}

            {issue.blocked_by.length > 0 ? (
              <section className="issue-detail__section" aria-labelledby="issue-blockers-title">
                <h2 id="issue-blockers-title">Blockers</h2>
                <ul className="issue-detail__blockers">
                  {issue.blocked_by.map((blocker) => (
                    <li key={blocker.id ?? blocker.identifier}>
                      <span>{blocker.identifier ?? blocker.id}</span>
                      {blocker.state ? <span>{formatStatus(blocker.state)}</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        ) : null}
      </section>
    </main>
  );
}

function formatStatus(state: string) {
  const status = normalizeStatus(state);
  const column = columns.find((candidate) => candidate.status === status);
  return column?.label ?? 'Not started';
}
