import { data, flash, hkd } from '../lib/page.js';
import { PageHead, Stat, Card, EnumBadge, Button, EmptyState, TableWrap, Bar, Csrf, Flash } from '../components/ui.jsx';

export const name = 'mgmt-fees';
export const title = 'Fee Collection';

export default function MgmtFees() {
  const d = data;
  const rows = d.rows || [];
  const rate = d.collectionRate ?? 0;
  const rateTone = rate >= 80 ? 'ok' : rate >= 50 ? 'warn' : 'danger';

  return (
    <>
      <PageHead title="Fee Collection" />

      <Flash flash={flash} />

      <div className="grid grid--4" style={{ marginBottom: 16 }}>
        <Stat label="Occupied units" value={d.totalOccupied ?? 0} icon="building" />
        <Stat label="Paid" value={d.paid ?? 0} icon="check" tone="ok" />
        <Stat label="Due" value={d.due ?? 0} icon="dollar" tone="warn" />
        <Stat label="Overdue" value={d.overdue ?? 0} icon="alert" tone="danger" />
      </div>

      <div className="stack">
        <Card title="Collection rate" icon="chart">
          <Bar pct={rate} tone={rateTone} showLabel />
        </Card>

        <Card title="Run fee reminders" icon="send">
          <form method="post" action="/mgmt/fees/run-reminders" className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Csrf />
            <Button type="submit" variant="primary" icon="send">Run fee reminders now</Button>
            <span className="muted small">Normally runs on the 1st of each month (FR-6.3).</span>
          </form>
        </Card>

        <Card title="Units with outstanding fees" icon="dollar" flush>
          {rows.length === 0
            ? <EmptyState icon="check" title="All occupied units are paid up." />
            : (
              <TableWrap>
                <thead><tr><th>Unit</th><th>Occupant</th><th>Status</th><th>Balance</th><th>Due date</th><th></th></tr></thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id}>
                      <td className="strong">{u.fullCode}</td>
                      <td>{u.occupant || <span className="muted">—</span>}</td>
                      <td><EnumBadge type="FeeStatus" value={u.feeStatus} /></td>
                      <td className="num">{hkd(u.balance)}</td>
                      <td className="nowrap">{u.dueDate || <span className="muted">—</span>}</td>
                      <td className="num"><Button href={'/mgmt/fees/units/' + u.id} variant="ghost" size="sm" iconRight="chevronRight">Manage</Button></td>
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
