import { data } from '../lib/page.js';
import { enumOptions } from '../lib/enums.js';
import { PageHead, Card, Button, Field, Input, Textarea, Select, Csrf } from '../components/ui.jsx';

export const name = 'mgmt-notification-new';
export const title = 'Compose Notification';

export default function MgmtNotificationNew() {
  const d = data;
  const templates = d.templates || [];
  const categories = d.categories || [];
  const blocks = d.blocks || [];
  const pre = d.pre || {};

  return (
    <>
      <PageHead
        title="Compose Notification"
        back={{ href: '/mgmt/notifications', label: 'Notifications' }}
      />

      <Card title="Start from a HK template (FR-6)" icon="sparkles">
        {templates.length === 0
          ? <span className="muted">No templates available.</span>
          : (
            <div className="btn-row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {templates.map((t) => (
                <Button key={t.code} href={'/mgmt/notifications/new?template=' + t.code} variant="ghost" size="sm">{t.name}</Button>
              ))}
            </div>
          )}
      </Card>

      <Card title="Notification" icon="bell">
        <form method="post" action="/mgmt/notifications">
          <Csrf />

          <Field label="Title" htmlFor="title" full>
            <Input id="title" name="title" required defaultValue={pre.title} />
          </Field>

          <div className="form-grid">
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" options={categories} defaultValue={pre.category} />
            </Field>
            <Field label="Severity" htmlFor="severity">
              <Select id="severity" name="severity" options={enumOptions('Severity')} defaultValue={pre.severity} />
            </Field>
          </div>

          <Field label="Content (English)" htmlFor="contentEn" full>
            <Textarea id="contentEn" name="contentEn" rows={4} required defaultValue={pre.contentEn} />
          </Field>
          <Field label="Content (中文)" htmlFor="contentZh" full>
            <Textarea id="contentZh" name="contentZh" rows={4} defaultValue={pre.contentZh} />
          </Field>

          <Field label="Recipients" htmlFor="scopeType">
            <Select id="scopeType" name="scopeType" options={[
              { value: 'ALL', label: 'All residents' },
              { value: 'BLOCK', label: 'Specific block (batch)' },
            ]} />
          </Field>

          <Field label="Block (if specific)" htmlFor="scopeId">
            <Select id="scopeId" name="scopeId" includeEmpty options={blocks.map((b) => ({ value: b.id, label: b.blockName }))} />
          </Field>

          <Field label="When" htmlFor="when">
            <Select id="when" name="when" options={[
              { value: 'now', label: 'Send now' },
              { value: 'later', label: 'Schedule for later' },
            ]} />
          </Field>

          <Field label="Scheduled time" htmlFor="scheduledAt" hint="(used only with Schedule for later — FR-1.4)">
            <Input id="scheduledAt" type="datetime-local" name="scheduledAt" />
          </Field>

          <Button type="submit" variant="primary" icon="send">Dispatch</Button>
        </form>
      </Card>
    </>
  );
}
