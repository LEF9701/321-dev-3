import { data, flash } from '../lib/page.js';
import { enumOptions } from '../lib/enums.js';
import { PageHead, Card, Button, Field, Input, Select, Csrf, Alert, Flash } from '../components/ui.jsx';

export const name = 'mgmt-resident-form';

export default function MgmtResidentForm() {
  const d = data;
  const action = d.isNew ? '/mgmt/residents' : '/mgmt/residents/' + d.residentId;
  const unitOptions = (d.units || []).map((u) => ({ value: u.id, label: u.fullCode }));

  return (
    <>
      <PageHead
        title={d.isNew ? 'Add resident' : 'Edit resident'}
        back={{ href: '/mgmt/residents', label: 'Residents' }}
      />

      <Flash flash={flash} />

      <Card>
        <form method="post" action={action} className="stack">
          <Csrf />
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" required defaultValue={d.name || ''} />
          </Field>
          <Field label="Email (login)" htmlFor="email">
            <Input id="email" name="email" type="email" required defaultValue={d.email || ''} />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={d.phone || ''} />
          </Field>
          <Field label="Language" htmlFor="language">
            <Select id="language" name="language" options={enumOptions('Language')} defaultValue={d.language ?? ''} />
          </Field>
          <Field label="Unit" htmlFor="unitId">
            <Select id="unitId" name="unitId" options={unitOptions} includeEmpty emptyLabel="— unassigned —"
                    defaultValue={d.unitId ?? ''} />
          </Field>

          {d.isNew && (
            <Alert tone="info">
              New residents get the default password <b>resident123</b> and default Email / preferred-language preferences.
            </Alert>
          )}

          <div>
            <Button type="submit" variant="primary" icon="check">Save</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
