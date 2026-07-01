import { data } from '../lib/page.js';
import { PageHead, Card, EnumBadge, TableWrap, DL } from '../components/ui.jsx';

export const name = 'resident-notification';

export default function ResidentNotification() {
  const d = data;
  const n = d.n || {};
  const logs = d.logs || [];

  return (
    <>
      <PageHead title={n.title} back={{ href: '/resident/inbox', label: 'Inbox' }} />

      <div className="stack">
        <Card>
          <DL items={[
            ['Category', <EnumBadge type="NoticeCategory" value={n.category} />],
            ['Severity', <EnumBadge type="Severity" value={n.severity} />],
            ['Sent', n.dispatchedAt],
            ['From', n.createdByName],
          ]} />
        </Card>

        <Card title="English" icon="bell">
          <p style={{ whiteSpace: 'pre-wrap' }}>{n.contentEn}</p>
          {n.contentZh && (
            <>
              <h3 style={{ marginTop: 18 }}>中文</h3>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{n.contentZh}</p>
            </>
          )}
        </Card>

        <Card title="Delivery to you" icon="send"
              sub="How this notice was routed to you and the delivery outcome." flush>
          <TableWrap>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Address</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Delivered</th>
                <th>Read</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td><EnumBadge type="Channel" value={l.channel} dot={false} /></td>
                  <td className="mono small">{l.recipientAddress}</td>
                  <td><EnumBadge type="DeliveryStatus" value={l.status} /></td>
                  <td className="nowrap muted">{l.sentAt || '—'}</td>
                  <td className="nowrap muted">{l.deliveredAt || '—'}</td>
                  <td className="nowrap muted">{l.readAt || '—'}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}
