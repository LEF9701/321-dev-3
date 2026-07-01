import { data } from '../lib/page.js';
import { PageHead, Stat, Card, EnumBadge, Button, EmptyState, TableWrap, Bar } from '../components/ui.jsx';

export const name = 'mgmt-analytics';
export const title = 'Delivery Analytics';

export default function MgmtAnalytics() {
  const d = data;
  const overall = d.overall || {};
  const channels = overall.perChannel || [];
  const rows = d.rows || [];

  return (
    <>
      <PageHead title="Delivery Analytics" />

      <div className="grid grid--4" style={{ marginBottom: 16 }}>
        <Stat label="Total attempts" value={overall.attempts ?? 0} icon="send" />
        <Stat label="Delivered" value={overall.delivered ?? 0} icon="check" tone="ok" />
        <Stat label="Read" value={overall.read ?? 0} icon="inbox" tone="brand" />
        <Stat label="Failed" value={overall.failed ?? 0} icon="alert"
              tone={overall.failed > 0 ? 'danger' : undefined} />
      </div>

      <div className="stack">
        <Card title="Delivery rate" icon="chart">
          <div className="stack">
            <div>
              <div className="field__label">Delivery rate</div>
              <Bar pct={overall.deliveryRatePct ?? 0} showLabel />
            </div>
            <div>
              <div className="field__label">Read rate</div>
              <Bar pct={overall.readRatePct ?? 0} showLabel />
            </div>
          </div>
        </Card>

        <Card title="By channel" icon="sliders" flush>
          {channels.length === 0
            ? <EmptyState icon="inbox" title="No delivery data yet" />
            : (
              <TableWrap>
                <thead><tr><th>Channel</th><th>Attempts</th><th>Delivered</th><th>Read</th><th>Failed</th></tr></thead>
                <tbody>
                  {channels.map((c, idx) => (
                    <tr key={idx}>
                      <td><EnumBadge type="Channel" value={c.channel} /></td>
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

        <Card title="Per notification" icon="bell" flush>
          {rows.length === 0
            ? <EmptyState icon="inbox" title="No dispatched notifications yet" />
            : (
              <TableWrap>
                <thead><tr><th>Created</th><th>Title</th><th>Category</th><th>Recipients</th><th>Delivery rate</th><th>Read rate</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="nowrap muted small">{r.createdAt}</td>
                      <td><a className="strong" href={`/mgmt/notifications/${r.id}`}>{r.title}</a></td>
                      <td><EnumBadge type="NoticeCategory" value={r.category} dot={false} /></td>
                      <td className="num">{r.recipients}</td>
                      <td style={{ minWidth: 140 }}><Bar pct={r.deliveryRatePct ?? 0} showLabel /></td>
                      <td className="num">{r.readRatePct ?? 0}%</td>
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
