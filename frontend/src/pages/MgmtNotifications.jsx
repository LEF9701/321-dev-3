import { data } from '../lib/page.js';
import { PageHead, Card, Badge, EnumBadge, Button, EmptyState, TableWrap, Bar } from '../components/ui.jsx';

export const name = 'mgmt-notifications';
export const title = 'Notifications';

export default function MgmtNotifications() {
  const rows = data.rows || [];

  return (
    <>
      <PageHead
        title="Notifications"
        actions={<Button href="/mgmt/notifications/new" variant="primary" icon="plus">Compose</Button>}
      />

      <Card flush>
        {rows.length === 0
          ? <EmptyState icon="bell" title="No notifications yet">Compose your first notice to residents.</EmptyState>
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Delivered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="nowrap muted small">{r.createdAt}</td>
                    <td><a className="strong" href={`/mgmt/notifications/${r.id}`}>{r.title}</a></td>
                    <td><EnumBadge type="NoticeCategory" value={r.category} dot={false} /></td>
                    <td className="muted">{r.recipientScope}</td>
                    <td>
                      {r.dispatched
                        ? <Badge tone="ok">Dispatched</Badge>
                        : <Badge tone="warn">Scheduled {r.scheduledAt}</Badge>}
                    </td>
                    <td className="num">{r.recipients}</td>
                    <td><Bar pct={r.deliveryRatePct} showLabel /></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
