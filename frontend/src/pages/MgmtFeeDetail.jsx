import { data, flash } from '../lib/page.js';
import { enumOptions } from '../lib/enums.js';
import { PageHead, Card, Button, Field, Input, Select, Csrf, Flash, EmptyState, EnumBadge, TableWrap, DL } from '../components/ui.jsx';

export const name = 'mgmt-fee-detail';

export default function MgmtFeeDetail() {
  const d = data;
  const unit = d.unit || {};
  const occupant = d.occupant || null;
  const reminders = d.reminders || [];

  return (
    <>
      <PageHead title={unit.fullCode + ' — Fee'} back={{ href: '/mgmt/fees', label: 'Fee Collection' }} />

      <Flash flash={flash} />

      <Card title="Occupant" icon="users">
        {occupant
          ? <DL items={[['Name', occupant.name], ['Email', occupant.email], ['Phone', occupant.phone]]} />
          : <span className="muted">— vacant / no resident assigned —</span>}
      </Card>

      <Card title="Define fee" icon="dollar">
        <form method="post" action={'/mgmt/fees/units/' + unit.id} className="stack">
          <Csrf />
          <div className="grid grid--2">
            <Field label="Status" htmlFor="feeStatus">
              <Select id="feeStatus" name="feeStatus" options={enumOptions('FeeStatus')} defaultValue={unit.feeStatus} />
            </Field>
            <Field label="Outstanding balance (HK$)" htmlFor="balance">
              <Input id="balance" name="balance" type="number" step="0.01" defaultValue={unit.balance} />
            </Field>
            <Field label="Due date" htmlFor="dueDate">
              <Input id="dueDate" name="dueDate" type="date" defaultValue={unit.dueDate || ''} />
            </Field>
          </div>
          <div>
            <Button type="submit" variant="primary" icon="check">Save fee</Button>
          </div>
        </form>
      </Card>

      <Card title="Send a reminder" icon="send">
        <div className="row" style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="muted small">Current status:</span>
          <EnumBadge type="FeeStatus" value={unit.feeStatus} />
        </div>
        <div className="btn-row" style={{ flexWrap: 'wrap', gap: 12 }}>
          <form method="post" action={'/mgmt/fees/units/' + unit.id + '/remind'} style={{ display: 'inline' }}>
            <Csrf />
            <input type="hidden" name="escalate" value="false" />
            <Button type="submit" variant="primary" icon="send">Send standard reminder</Button>
          </form>
          <form method="post" action={'/mgmt/fees/units/' + unit.id + '/remind'} style={{ display: 'inline' }}>
            <Csrf />
            <input type="hidden" name="escalate" value="true" />
            <Button type="submit" variant="danger" icon="alert">Send final (overdue) notice</Button>
          </form>
        </div>
        {!occupant && <div className="muted small" style={{ marginTop: 12 }}>No resident is assigned to this unit.</div>}
      </Card>

      <Card title="Reminder history" icon="history" flush>
        {reminders.length === 0
          ? <EmptyState icon="inbox" title="No reminders sent yet." />
          : (
            <TableWrap>
              <thead>
                <tr><th>Sent</th><th>Notice</th><th>Channel(s)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr key={r.id}>
                    <td className="nowrap">{r.dispatchedAt || <span className="muted">—</span>}</td>
                    <td>{r.title}</td>
                    <td>{r.channels || <span className="muted">—</span>}</td>
                    <td><EnumBadge type="DeliveryStatus" value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
