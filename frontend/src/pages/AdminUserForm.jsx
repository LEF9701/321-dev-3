import { data, flash } from '../lib/page.js';
import { enumOptions } from '../lib/enums.js';
import { PageHead, Card, Field, Input, Select, Button, Csrf, Flash } from '../components/ui.jsx';

export const name = 'admin-user-form';

export default function AdminUserForm() {
  const d = data;
  const action = d.isNew ? '/admin/users' : '/admin/users/' + d.userId;

  return (
    <>
      <PageHead title={d.isNew ? 'Add user' : 'Edit user'} back={{ href: '/admin/users', label: 'Users' }} />

      <Flash flash={flash} />

      <Card>
        <form method="post" action={action}>
          <Csrf />
          <div className="form-grid">
            <Field label="Name" htmlFor="name">
              <Input id="name" name="name" required defaultValue={d.name} />
            </Field>
            <Field label="Email (login)" htmlFor="email">
              <Input id="email" name="email" type="email" required defaultValue={d.email} />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={d.phone} />
            </Field>
            <Field label="Role" htmlFor="role">
              <Select id="role" name="role" options={enumOptions('Role')} defaultValue={d.role} />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Language" htmlFor="language">
              <Select id="language" name="language" options={enumOptions('Language')} defaultValue={d.language} />
            </Field>
            <Field label="Unit (residents only)" htmlFor="unitId">
              <Select
                id="unitId"
                name="unitId"
                options={(d.units || []).map((u) => ({ value: u.id, label: u.fullCode }))}
                includeEmpty
                emptyLabel="— none —"
                defaultValue={d.unitId ?? ''}
              />
            </Field>
          </div>

          <Field label={d.isNew ? 'Password' : 'New password (blank = keep)'} htmlFor="password" full>
            <Input id="password" name="password" type="text" required={d.isNew} />
          </Field>

          <Button type="submit" variant="primary">Save</Button>
        </form>
      </Card>
    </>
  );
}
