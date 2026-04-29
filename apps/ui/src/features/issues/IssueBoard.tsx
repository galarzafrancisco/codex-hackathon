import { FormEvent, useMemo, useState } from 'react';
import type { IssueResponseDto } from '../../api/client';
import { normalizeStatus, type IssueBoardStatus, type NewIssueForm, useIssuesBoard } from './useIssuesBoard';
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

export function IssueBoard() {
  const {
    createIssue,
    error,
    initialNewIssueForm,
    isCreating,
    isLoading,
    issues,
    reloadIssues,
    updateIssueStatus,
    updatingIssueId,
  } = useIssuesBoard();
  const [query, setQuery] = useState('');
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [form, setForm] = useState<NewIssueForm>(initialNewIssueForm);

  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return issues;
    }

    return issues.filter((issue) => {
      const searchableText = [issue.title, issue.identifier, issue.branch_name, ...issue.labels]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [issues, query]);

  const issuesByStatus = useMemo(
    () =>
      columns.reduce<Record<IssueBoardStatus, IssueResponseDto[]>>(
        (groupedIssues, column) => {
          groupedIssues[column.status] = filteredIssues.filter((issue) => normalizeStatus(issue.state) === column.status);
          return groupedIssues;
        },
        {
          done: [],
          for_review: [],
          in_progress: [],
          not_started: [],
        },
      ),
    [filteredIssues],
  );

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
      <section className="issue-board" aria-labelledby="issues-title">
        <header className="issue-board__toolbar">
          <div className="issue-board__title">
            <span className="issue-board__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M7 12.2 10.2 15.4 17.4 7.8" />
              </svg>
            </span>
            <h1 id="issues-title">Issues</h1>
          </div>
          <div className="issue-board__actions">
            <label className="search-field">
              <span className="search-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <circle cx="10.5" cy="10.5" r="5.8" />
                  <path d="m15 15 4 4" />
                </svg>
              </span>
              <span className="sr-only">Search issues</span>
              <input
                type="search"
                placeholder="Search issues..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button className="button button--primary" type="button" onClick={() => setIsNewIssueOpen(true)}>
              New issue
            </button>
          </div>
        </header>

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
                <div className="issue-column__cards">
                  {issuesByStatus[column.status].map((issue) => (
                    <IssueCard
                      issue={issue}
                      isUpdating={updatingIssueId === issue.id}
                      key={issue.id}
                      onStatusChange={(status) => void updateIssueStatus(issue, status)}
                    />
                  ))}
                  {issuesByStatus[column.status].length === 0 ? (
                    <div className="issue-card issue-card--empty">No issues in this column</div>
                  ) : null}
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
            <div className="field-grid">
              <label className="field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((currentForm) => ({ ...currentForm, status: event.target.value as IssueBoardStatus }))
                  }
                >
                  {columns.map((column) => (
                    <option key={column.status} value={column.status}>
                      {column.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.priority}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, priority: event.target.value }))}
                />
              </label>
            </div>
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
    </main>
  );
}

function IssueCard({
  isUpdating,
  issue,
  onStatusChange,
}: {
  isUpdating: boolean;
  issue: IssueResponseDto;
  onStatusChange: (status: IssueBoardStatus) => void;
}) {
  return (
    <article className="issue-card">
      <div className="issue-card__topline">
        <div>
          <h3>{issue.title}</h3>
          <p>{issue.identifier}</p>
        </div>
        {normalizeStatus(issue.state) === 'done' ? (
          <span className="done-badge" aria-label="Done">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M7 12.2 10.2 15.4 17.4 7.8" />
            </svg>
          </span>
        ) : null}
      </div>
      <div className="issue-card__labels" aria-label="Labels">
        {issue.labels.length > 0 ? issue.labels.map((label) => <span key={label}>{label}</span>) : <span>unlabeled</span>}
      </div>
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
      <label className="issue-card__status">
        <span className="sr-only">Move issue</span>
        <select
          aria-label={`Move ${issue.identifier}`}
          disabled={isUpdating}
          value={normalizeStatus(issue.state)}
          onChange={(event) => onStatusChange(event.target.value as IssueBoardStatus)}
        >
          {columns.map((column) => (
            <option key={column.status} value={column.status}>
              {column.label}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}
