import { data, flash } from '../lib/page.js';
import { cx, initials } from '../lib/page.js';
import { enumLabel, ISSUE_STATUS_ORDER } from '../lib/enums.js';
import { PageHead, Card, Badge, EnumBadge, Button, Textarea, Csrf, EmptyState, Flash, DL } from '../components/ui.jsx';

export const name = 'resident-issue-detail';

export default function ResidentIssueDetail() {
  const d = data;
  const issue = d.issue || {};
  const issueId = d.issueId ?? issue.id;
  const comments = d.comments || [];
  const withdrawn = issue.status === 'WITHDRAWN';
  const currentIdx = ISSUE_STATUS_ORDER.indexOf(issue.status);

  return (
    <>
      <PageHead
        title={`Issue ${issue.refNumber}`}
        back={{ href: '/resident/issues', label: 'My Issues' }}
        actions={issue.status === 'SUBMITTED' ? (
          <form method="post" action={'/resident/issues/' + issueId + '/withdraw'}
                onSubmit={(e) => { if (!confirm('Withdraw this issue? This cannot be undone.')) e.preventDefault(); }}>
            <Csrf />
            <Button type="submit" variant="danger" icon="x">Withdraw this issue</Button>
          </form>
        ) : undefined}
      />

      <Flash flash={flash} />

      <div className="stack">
        {withdrawn ? (
          <Card title="Status" icon="history" sub="This issue was withdrawn and is no longer being processed.">
            <Badge tone="muted">Withdrawn</Badge>
          </Card>
        ) : (
          <Card title="Status workflow" icon="history"
                sub="Submitted → Under Review → In Progress → Resolved. You are notified whenever the status changes.">
            <div className="stepper">
              {ISSUE_STATUS_ORDER.map((s, i) => {
                const done = currentIdx >= 0 && i < currentIdx;
                const current = i === currentIdx;
                return (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {i > 0 && <span className="arrow">→</span>}
                    <span className={cx('step', done && 'is-done', current && 'is-current')}>
                      <span className="n">{i + 1}</span>
                      {enumLabel('IssueStatus', s)}
                    </span>
                  </span>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Issue details" icon="wrench">
          <DL items={[
            ['Tracking number', <span className="mono strong">{issue.refNumber}</span>],
            ['Category', enumLabel('IssueCategory', issue.category)],
            ['Status', <EnumBadge type="IssueStatus" value={issue.status} />],
            ['Priority', <EnumBadge type="IssuePriority" value={issue.priority} />],
            ['Assigned to', issue.assignedTo || <span className="muted">Not yet assigned</span>],
            ['Reported', issue.createdAt],
            ['Last updated', issue.updatedAt],
            ['Description', <span style={{ whiteSpace: 'pre-wrap' }}>{issue.description}</span>],
            issue.resolutionNote
              ? ['Management note', <span style={{ whiteSpace: 'pre-wrap' }}>{issue.resolutionNote}</span>]
              : null,
          ]} />
        </Card>

        {issue.photoFilename && (
          <Card title="Photo" icon="file">
            <img src={`/uploads/${issue.photoFilename}`} alt="issue photo"
                 style={{ maxWidth: 320, borderRadius: 8, border: '1px solid var(--border)' }} />
          </Card>
        )}

        <Card title="Conversation" icon="mail" sub="Updates and replies between you and management.">
          {comments.length === 0
            ? <EmptyState icon="mail" title="No comments yet." />
            : (
              <div style={{ marginBottom: 4 }}>
                {comments.map((c, i) => (
                  <div className="chat-msg" key={i}>
                    <div className={cx('chat-msg__avatar', c.authorRole === 'RESIDENT' ? 'me' : 'ai')}>
                      {initials(c.authorName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="row" style={{ gap: 8, marginBottom: 6, alignItems: 'center' }}>
                        <span className="strong">{c.authorName}</span>
                        <Badge tone={c.authorRole === 'RESIDENT' ? 'muted' : 'brand'}>
                          {enumLabel('Role', c.authorRole)}
                        </Badge>
                        <span className="small muted">{c.createdAt}</span>
                      </div>
                      <div className="chat-bubble">{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          <form method="post" action={'/resident/issues/' + issueId + '/comment'}>
            <Csrf />
            <Textarea name="body" rows={3} required placeholder="Add a comment or update for management…" />
            <div style={{ marginTop: 10 }}>
              <Button type="submit" variant="primary" icon="send">Post comment</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
