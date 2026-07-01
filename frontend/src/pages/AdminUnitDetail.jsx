import { data, flash } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, Button, Field, Input, Select, Csrf, Flash, EmptyState, EnumBadge, TableWrap, DL } from '../components/ui.jsx';

export const name = 'admin-unit-detail';

export default function AdminUnitDetail() {
  const d = data;
  const unit = d.unit || {};
  const occupant = d.occupant || null;
  const issues = d.issues || [];

  return (
    <>
      <PageHead title={unit.unitCode} back={{ href: '/admin/blocks/' + unit.blockId, label: 'Block' }} />

      <Flash flash={flash} />

      <Card title="Occupant" icon="users">
        {occupant
          ? <DL items={[['Name', occupant.name], ['Email', occupant.email], ['Phone', occupant.phone]]} />
          : <span className="muted">— vacant / no resident account —</span>}
      </Card>

      <Card title="Edit unit" icon="edit">
        <form method="post" action={'/admin/units/' + unit.id} className="stack">
          <Csrf />
          <Field label="Unit code" htmlFor="unitCode">
            <Input id="unitCode" name="unitCode" required defaultValue={unit.unitCode || ''} />
          </Field>
          <div className="grid grid--2">
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" options={enumOptions('UnitStatus')} defaultValue={unit.status ?? ''} />
            </Field>
            <Field label="Fee status" htmlFor="feeStatus">
              <Select id="feeStatus" name="feeStatus" options={enumOptions('FeeStatus')} defaultValue={unit.feeStatus ?? ''} />
            </Field>
          </div>
          <div className="grid grid--2">
            <Field label="Balance (HK$)" htmlFor="balance">
              <Input id="balance" name="balance" type="number" step="0.01" defaultValue={unit.balance ?? ''} />
            </Field>
            <Field label="Due date" htmlFor="dueDate">
              <Input id="dueDate" name="dueDate" type="date" defaultValue={unit.dueDate || ''} />
            </Field>
          </div>
          <div>
            <Button type="submit" variant="primary" icon="check">Save</Button>
          </div>
        </form>
      </Card>

      <Card title="Danger zone">
        <form method="post" action={'/admin/units/' + unit.id + '/delete'} style={{ display: 'inline' }}
              onSubmit={(e) => { if (!confirm('Delete this unit?')) e.preventDefault(); }}>
          <Csrf />
          <Button type="submit" variant="danger" icon="trash">Delete unit</Button>
        </form>
      </Card>

      <Card title="Issues at this unit" icon="wrench" flush>
        {issues.length === 0
          ? <EmptyState icon="check" title="No issues" />
          : (
            <TableWrap>
              <thead>
                <tr><th>Ref</th><th>Category</th><th>Status</th><th>Priority</th></tr>
              </thead>
              <tbody>
                {issues.map((i) => (
                  <tr key={i.id}>
                    <td><a className="mono strong" href={`/mgmt/issues/${i.id}`}>{i.refNumber}</a></td>
                    <td>{enumLabel('IssueCategory', i.category)}</td>
                    <td><EnumBadge type="IssueStatus" value={i.status} /></td>
                    <td><EnumBadge type="IssuePriority" value={i.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
