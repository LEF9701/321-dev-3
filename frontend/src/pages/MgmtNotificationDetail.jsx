import { data } from '../lib/page.js';
import { PageHead, Card, Stat, Badge, EnumBadge, EmptyState, TableWrap, Bar, Button } from '../components/ui.jsx';

export const name = 'mgmt-notification-detail';

export default function MgmtNotificationDetail() {
  const d = data;
  const n = d.n || {};
  const stats = d.stats || {};
  const perChannel = stats.perChannel || [];
  const logs = d.logs || [];

  return (
    <>
      <PageHead title={n.title} back={{ href: '/mgmt/notifications', label: 'Notifications' }}
                actions={<Button href={`/mgmt/notifications/${n.id}/edit`} icon="edit">Edit notice</Button>} />

      <div className="btn-row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <EnumBadge type="NoticeCategory" value={n.category} dot={false} />
        <EnumBadge type="Severity" value={n.severity} />
        <span className="muted small">Scope: {n.recipientScope}</span>
        {n.forcedAllChannels && <Badge tone="danger">FORCED all channels</Badge>}
        {n.dispatchedAt && <span className="muted small">Dispatched {n.dispatchedAt}</span>}
      </div>

      <Card title="Content" icon="file">
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{n.contentEn}</p>
        {n.contentZh && <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{n.contentZh}</p>}
      </Card>

      <Card title="Delivery analytics" icon="chart">
        <div className="grid grid--3">
          <Stat label="Recipients" value={stats.recipients ?? 0} icon="users" />
          <Stat label="Total attempts" value={stats.attempts ?? 0} icon="send" />
          <Stat label="Delivered" value={stats.delivered ?? 0} icon="check"
                hint={<Bar pct={stats.deliveryRatePct} showLabel />} />
          <Stat label="Read" value={stats.read ?? 0} icon="inbox"
                hint={<Bar pct={stats.readRatePct} showLabel />} />
          <Stat label="Failed" value={stats.failed ?? 0} icon="alert" tone={stats.failed > 0 ? 'danger' : undefined} />
          <Stat label="Pending" value={stats.pending ?? 0} icon="history" />
        </div>
      </Card>

      <Card title="By channel" icon="sliders" flush>
        {perChannel.length === 0
          ? <EmptyState icon="sliders" title="No channel data" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Attempts</th>
                  <th>Delivered</th>
                  <th>Read</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {perChannel.map((c, i) => (
                  <tr key={i}>
                    <td><EnumBadge type="Channel" value={c.channel} dot={false} /></td>
                    <td className="num">{c.attempts}</td>
                    <td className="num">{c.delivered}</td>
                    <td className="num">{c.read}</td>
                    <td className="num">{c.failed}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>

      <Card title="Per-recipient delivery log" icon="clipboard"
            sub="Each row is a mocked send: channel, recipient address and simulated status. No real provider is contacted."
            flush>
        {logs.length === 0
          ? <EmptyState icon="inbox" title="No delivery records" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Channel</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Read</th>
                  <th>Escalation</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td className="strong">{l.recipientName ?? <span className="muted">—</span>}</td>
                    <td><EnumBadge type="Channel" value={l.channel} dot={false} /></td>
                    <td className="mono small">{l.recipientAddress}</td>
                    <td><EnumBadge type="DeliveryStatus" value={l.status} /></td>
                    <td className="nowrap muted small">{l.sentAt ?? '—'}</td>
                    <td className="nowrap muted small">{l.deliveredAt ?? '—'}</td>
                    <td className="nowrap muted small">{l.readAt ?? '—'}</td>
                    <td>{l.escalation && <Badge tone="warn">Escalation</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
