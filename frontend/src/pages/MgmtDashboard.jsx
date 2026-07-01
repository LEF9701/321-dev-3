import { data } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Stat, Card, Badge, EnumBadge, Button, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'mgmt-dashboard';
export const title = 'Overview';

export default function MgmtDashboard() {
  const d = data;
  const issues = d.recentIssues || [];
  const notifs = d.recentNotifications || [];

  return (
    <>
      <PageHead
        title="Management Overview"
        actions={<Button href="/mgmt/notifications/new" variant="primary" icon="plus">Compose</Button>}
      />

      <div className="grid grid--3" style={{ marginBottom: 16 }}>
        <Stat label="Residents" value={d.residentCount ?? 0} icon="users" />
        <Stat label="Open issues" value={d.openIssues ?? 0} icon="wrench"
              tone={d.openIssues > 0 ? 'warn' : undefined} />
        <Stat label="Overdue units" value={d.overdueUnits ?? 0} icon="dollar"
              tone={d.overdueUnits > 0 ? 'danger' : undefined} />
      </div>

      <div className="stack">
        <Card title="Recent issues" icon="wrench" flush>
          {issues.length === 0
            ? <EmptyState icon="check" title="No issues yet" />
            : (
              <TableWrap>
                <thead><tr><th>Ref</th><th>Category</th><th>Status</th><th>Priority</th><th>Reporter</th></tr></thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i.id}>
                      <td><a className="mono strong" href={`/mgmt/issues/${i.id}`}>{i.refNumber}</a></td>
                      <td>{enumLabel('IssueCategory', i.category)}</td>
                      <td><EnumBadge type="IssueStatus" value={i.status} /></td>
                      <td><EnumBadge type="IssuePriority" value={i.priority} /></td>
                      <td className="muted">{i.reporterName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
        </Card>

        <Card title="Recent notifications" icon="bell" flush>
          {notifs.length === 0
            ? <EmptyState icon="inbox" title="No notifications yet" />
            : (
              <TableWrap>
                <thead><tr><th>Created</th><th>Title</th><th>Category</th><th>Status</th></tr></thead>
                <tbody>
                  {notifs.map((n) => (
                    <tr key={n.id}>
                      <td className="nowrap muted small">{n.createdAt}</td>
                      <td><a className="strong" href={`/mgmt/notifications/${n.id}`}>{n.title}</a></td>
                      <td><EnumBadge type="NoticeCategory" value={n.category} dot={false} /></td>
                      <td>
                        {n.dispatched
                          ? <Badge tone="ok">Dispatched</Badge>
                          : <Badge tone="warn">Scheduled {n.scheduledAt}</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
        </Card>
      </div>
    </>
  );
}
