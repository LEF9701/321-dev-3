import { data, flash } from '../lib/page.js';
import { cx, initials } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, Badge, EnumBadge, Button, Field, Input, Textarea, Select, Csrf, EmptyState, DL, Flash } from '../components/ui.jsx';

export const name = 'mgmt-issue-detail';

export default function MgmtIssueDetail() {
  const i = data.issue || {};
  const issueId = data.issueId ?? i.id;
  const comments = data.comments || [];
  const action = (suffix) => `/mgmt/issues/${issueId}/${suffix}`;

  return (
    <>
      <PageHead title={`Issue ${i.refNumber}`} back={{ href: '/mgmt/issues', label: 'Issues' }} />

      <Flash flash={flash} />

      <Card>
        <DL items={[
          ['Reporter', i.reporterName],
          ['Unit', i.unitFullCode],
          ['Category', enumLabel('IssueCategory', i.category)],
          ['Status', <EnumBadge type="IssueStatus" value={i.status} />],
          ['Priority', <EnumBadge type="IssuePriority" value={i.priority} />],
          ['Assigned to', i.assignedTo],
          ['Reported', i.createdAt],
          ['Description', i.description],
          i.resolutionNote && ['Note', i.resolutionNote],
          i.photoFilename && ['Photo',
            <img
              src={'/uploads/' + i.photoFilename}
              style={{ maxWidth: 320, borderRadius: 8, border: '1px solid var(--border)' }}
              alt="Issue photo"
            />],
        ]} />
      </Card>

      <div className="grid grid--3">
        <Card title="Update status" icon="edit">
          <form method="post" action={action('status')}>
            <Csrf />
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" options={enumOptions('IssueStatus')} defaultValue={i.status} />
            </Field>
            <Field label="Note" htmlFor="note" hint="Resident auto-notified (FR-5.5).">
              <Textarea id="note" name="note" rows={2} placeholder="Note to resident" />
            </Field>
            <Button type="submit" variant="primary">Update status</Button>
          </form>
        </Card>

        <Card title="Set priority" icon="alert">
          <form method="post" action={action('priority')}>
            <Csrf />
            <Field label="Priority" htmlFor="priority">
              <Select id="priority" name="priority" options={enumOptions('IssuePriority')} defaultValue={i.priority} />
            </Field>
            <Button type="submit" variant="primary">Set priority</Button>
          </form>
        </Card>

        <Card title="Assign" icon="users">
          <form method="post" action={action('assign')}>
            <Csrf />
            <Field label="Assignee" htmlFor="assignee">
              <Input id="assignee" name="assignee" defaultValue={i.assignedTo} placeholder="e.g. Evergreen Maintenance Team" />
            </Field>
            <Button type="submit" variant="primary">Assign</Button>
          </form>
        </Card>
      </div>

      <Card title="Conversation" icon="mail" sub="Updates and replies between the resident and management.">
        {comments.length === 0
          ? <EmptyState icon="mail" title="No comments yet." />
          : (
            <div style={{ marginBottom: 4 }}>
              {comments.map((c, idx) => (
                <div className="chat-msg" key={idx}>
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

        <form method="post" action={action('comment')}>
          <Csrf />
          <Textarea name="body" rows={3} required placeholder="Reply to the resident…" />
          <div style={{ marginTop: 10 }}>
            <Button type="submit" variant="primary" icon="send">Reply</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
