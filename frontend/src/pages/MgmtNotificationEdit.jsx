import { data, flash } from '../lib/page.js';
import { enumOptions } from '../lib/enums.js';
import { PageHead, Card, Flash, Field, Input, Select, Textarea, Button, Csrf } from '../components/ui.jsx';

export const name = 'mgmt-notification-edit';
export const title = 'Edit notice';

export default function MgmtNotificationEdit() {
  const n = data.n || {};
  return (
    <>
      <PageHead title="Edit notice" sub="Update the notice content, category or severity."
                back={{ href: `/mgmt/notifications/${n.id}`, label: 'Notice' }} />
      <Flash flash={flash} />
      <Card>
        <form method="post" action={`/mgmt/notifications/${n.id}`}>
          <Csrf />
          <Field label="Title" htmlFor="title">
            <Input id="title" name="title" required defaultValue={n.title} />
          </Field>
          <div className="form-grid">
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" options={enumOptions('NoticeCategory')} defaultValue={n.category} />
            </Field>
            <Field label="Severity" htmlFor="severity">
              <Select id="severity" name="severity" options={enumOptions('Severity')} defaultValue={n.severity} />
            </Field>
          </div>
          <Field label="English content" htmlFor="contentEn">
            <Textarea id="contentEn" name="contentEn" rows={4} required defaultValue={n.contentEn} />
          </Field>
          <Field label="Chinese content (中文)" htmlFor="contentZh">
            <Textarea id="contentZh" name="contentZh" rows={4} defaultValue={n.contentZh} />
          </Field>
          <div className="btn-row">
            <Button type="submit" variant="primary" icon="check">Save changes</Button>
            <Button href={`/mgmt/notifications/${n.id}`} variant="ghost">Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
