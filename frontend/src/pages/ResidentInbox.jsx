import { data } from '../lib/page.js';
import { PageHead, Card, EnumBadge, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'resident-inbox';
export const title = 'Inbox';

export default function ResidentInbox() {
  const d = data;
  const inbox = d.inbox || [];

  return (
    <>
      <PageHead title="Inbox" sub="Timestamped notices delivered to you, with the delivery status on your chosen channel(s)." />

      <Card flush>
        {inbox.length === 0
          ? <EmptyState icon="inbox" title="No notifications yet" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Channel(s)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inbox.map((it) => (
                  <tr key={it.id}>
                    <td className="nowrap muted small">{it.dispatchedAt}</td>
                    <td>
                      {!it.read && <span className="unread-dot" />}
                      <a className="strong" href={`/resident/inbox/${it.id}`}>{it.title}</a>
                    </td>
                    <td><EnumBadge type="NoticeCategory" value={it.category} dot={false} /></td>
                    <td><EnumBadge type="Severity" value={it.severity} /></td>
                    <td className="muted">{it.channels}</td>
                    <td><EnumBadge type="DeliveryStatus" value={it.status} /></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
