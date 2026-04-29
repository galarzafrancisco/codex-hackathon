import { useEffect, useState } from 'react';
import { IssueBoard, IssueDetails } from './features/issues/IssueBoard';

export function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const issueDetailsMatch = path.match(/^\/issues\/([^/]+)$/);

  if (issueDetailsMatch) {
    return <IssueDetails issueId={decodeURIComponent(issueDetailsMatch[1])} />;
  }

  return <IssueBoard />;
}
