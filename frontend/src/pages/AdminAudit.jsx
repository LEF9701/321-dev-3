import { data, cx } from '../lib/page.js';
import { PageHead, Card, Badge, EmptyState, TableWrap, Icon } from '../components/ui.jsx';

export const name = 'admin-audit';
export const title = 'Audit Log';

export default function AdminAudit() {
  const logs = data.logs || [];
  const emergencyOnly = !!data.emergencyOnly;

  return (
    <>
      <PageHead title="Audit Log" sub="Record of sensitive actions for compliance." />

      <div className="pills" style={{ marginBottom: 16 }}>
        <a className={cx('pill', !emergencyOnly && 'is-active')} href="/admin/audit">All actions</a>
        <a className={cx('pill', emergencyOnly && 'is-active')} href="/admin/audit?filter=emergency">Emergency only</a>
      </div>

      <Card flush>
        {logs.length === 0 ? (
          <EmptyState icon="clipboard" title="No audit entries." />
        ) : (
          <TableWrap>
            <thead>
              <tr><th>Time</th><th>Actor</th><th>Action</th><th>Detail</th><th>Emergency</th></tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td className="nowrap mono small">{l.timestamp}</td>
                  <td>{l.actor}</td>
                  <td><Badge>{l.action}</Badge></td>
                  <td>{l.detail}</td>
                  <td className="center">
                    {l.emergencyRelated ? <Badge tone="danger" dot={false}><Icon name="alert" size={13} /></Badge> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
