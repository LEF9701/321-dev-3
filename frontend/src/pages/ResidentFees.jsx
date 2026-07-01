import { data, hkd } from '../lib/page.js';
import { PageHead, Card, EnumBadge, EmptyState, TableWrap, DL } from '../components/ui.jsx';

export const name = 'resident-fees';
export const title = 'Fees';

export default function ResidentFees() {
  const d = data;
  const unit = d.unit || null;
  const feeHistory = d.feeHistory || [];

  return (
    <>
      <PageHead title="Fees" sub="Current balance, due date and reminder history for your unit." />

      <div className="stack">
        <Card title="Management fee status" icon="dollar">
          {unit
            ? (
              <DL items={[
                ['Unit', unit.fullCode],
                ['Status', <EnumBadge type="FeeStatus" value={unit.feeStatus} />],
                ['Outstanding balance', hkd(unit.balance)],
                ['Due date', unit.dueDate],
              ]} />
            )
            : <EmptyState icon="home" title="No unit assigned" />}
        </Card>

        <Card title="Reminder history" icon="bell" flush>
          {feeHistory.length === 0
            ? <EmptyState icon="bell" title="No fee reminders received" />
            : (
              <TableWrap>
                <thead>
                  <tr>
                    <th>Received</th>
                    <th>Notice</th>
                    <th>Channel(s)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeHistory.map((it) => (
                    <tr key={it.id}>
                      <td className="nowrap muted small">{it.dispatchedAt}</td>
                      <td><a className="strong" href={`/resident/inbox/${it.id}`}>{it.title}</a></td>
                      <td className="muted">{it.channels}</td>
                      <td><EnumBadge type="DeliveryStatus" value={it.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
        </Card>

        <p className="muted small">This prototype mocks payment; no online payment gateway is wired up.</p>
      </div>
    </>
  );
}
