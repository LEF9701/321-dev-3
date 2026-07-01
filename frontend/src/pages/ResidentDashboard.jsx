import { data, user } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Stat, Card, Badge, EnumBadge, Button, EmptyState, TableWrap, Icon } from '../components/ui.jsx';

export const name = 'resident-dashboard';
export const title = 'Dashboard';

export default function ResidentDashboard() {
  const d = data;
  const openIssues = (d.issues || []).filter((i) => i.status !== 'RESOLVED' && i.status !== 'WITHDRAWN');

  return (
    <>
      <PageHead
        title={`Welcome, ${user?.name || 'Resident'}`}
        sub={d.unitFullCode ? `Your unit · ${d.unitFullCode}` : 'No unit assigned'}
        actions={<Button href="/resident/issues/new" variant="primary" icon="plus">Report an issue</Button>}
      />

      <div className="grid grid--3" style={{ marginBottom: 16 }}>
        <Stat label="Unread notices" value={d.unreadCount ?? 0} icon="inbox"
              tone={d.unreadCount > 0 ? 'warn' : undefined} />
        <Stat label="Open issues" value={d.openIssueCount ?? 0} icon="wrench"
              tone={d.openIssueCount > 0 ? 'warn' : undefined} />
        <Stat label="Fee status" icon="dollar"
              tone={d.unitFeeStatus ? { OVERDUE: 'danger', DUE: 'warn', PAID: 'ok' }[d.unitFeeStatus] : undefined}
              value={d.unitFeeStatus ? enumLabel('FeeStatus', d.unitFeeStatus) : '—'} />
      </div>

      <div className="stack">
        <Card title="Recent notifications" icon="bell"
              actions={<Button href="/resident/inbox" variant="ghost" size="sm" iconRight="chevronRight">Full inbox</Button>}
              flush>
          {(!d.inbox || d.inbox.length === 0)
            ? <EmptyState icon="inbox" title="No notifications yet" />
            : (
              <TableWrap>
                <thead><tr><th>Received</th><th>Title</th><th>Category</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {d.inbox.map((it) => (
                    <tr key={it.id}>
                      <td className="nowrap muted small">{it.dispatchedAt}</td>
                      <td>
                        {!it.read && <span className="unread-dot" />}
                        <a className="strong" href={`/resident/inbox/${it.id}`}>{it.title}</a>
                      </td>
                      <td><EnumBadge type="NoticeCategory" value={it.category} dot={false} /></td>
                      <td><EnumBadge type="DeliveryStatus" value={it.status} /></td>
                      <td className="right"><a href={`/resident/inbox/${it.id}`}>View</a></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
        </Card>

        <Card title="My open issues" icon="wrench"
              actions={<Button href="/resident/issues" variant="ghost" size="sm" iconRight="chevronRight">All issues</Button>}
              flush>
          {openIssues.length === 0
            ? <EmptyState icon="check" title="No open issues">Everything looks good. <a href="/resident/issues/new">Report one »</a></EmptyState>
            : (
              <TableWrap>
                <thead><tr><th>Ref</th><th>Category</th><th>Status</th><th>Priority</th></tr></thead>
                <tbody>
                  {openIssues.map((i) => (
                    <tr key={i.id}>
                      <td><a className="mono strong" href={`/resident/issues/${i.id}`}>{i.refNumber}</a></td>
                      <td>{enumLabel('IssueCategory', i.category)}</td>
                      <td><EnumBadge type="IssueStatus" value={i.status} /></td>
                      <td><EnumBadge type="IssuePriority" value={i.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
        </Card>

        <Card title="Upcoming maintenance" icon="calendar" sub="Affecting the estate" flush>
          {(!d.schedules || d.schedules.length === 0)
            ? <EmptyState icon="calendar" title="Nothing scheduled" />
            : (
              <TableWrap>
                <thead><tr><th>Date</th><th>Work</th><th>Affected</th></tr></thead>
                <tbody>
                  {d.schedules.map((s, i) => (
                    <tr key={i}>
                      <td className="nowrap">{s.date}</td>
                      <td className="strong">{s.title}</td>
                      <td className="muted">{s.affectedScope}</td>
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
