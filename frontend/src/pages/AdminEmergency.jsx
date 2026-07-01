import { data, flash } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, Alert, Field, Input, Select, Textarea, Button, EmptyState, TableWrap, Csrf, Flash } from '../components/ui.jsx';

export const name = 'admin-emergency';
export const title = 'Emergency Control';

export default function AdminEmergency() {
  const d = data;
  const active = d.active;
  const pre = d.pre || {};
  const templates = d.emergencyTemplates || [];
  const broadcasts = d.broadcasts || [];

  return (
    <>
      <PageHead
        title="Emergency Control"
        sub={`Declare → forced multi-channel broadcast → voice escalation → close. ${d.residentCount ?? 0} residents in scope.`}
      />

      <Flash flash={flash} />

      {!active ? (
        <Card title="Declare an emergency">
          <form
            method="post"
            action="/admin/emergency/declare"
            onSubmit={(e) => { if (!confirm('Declare an emergency? This puts the system into elevated state.')) e.preventDefault(); }}
          >
            <Csrf />
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" options={enumOptions('EmergencyType')} />
            </Field>
            <Field label="Note / location" htmlFor="note">
              <Input id="note" name="note" size={50} placeholder="e.g. Smoke reported, Azalea Tower 12/F" />
            </Field>
            <Button type="submit" variant="danger">Declare emergency</Button>
          </form>
        </Card>
      ) : (
        <>
          <Alert tone="danger">
            <strong>{enumLabel('EmergencyType', active.type)}</strong> declared {active.declaredAt} by {active.declaredBy}.
            {active.note ? ' (' + active.note + ')' : ''}
          </Alert>

          <Card title="Broadcast" sub="Overrides preferences — sends on SMS + WhatsApp + Email.">
            {templates.length > 0 && (
              <div className="btn-row" style={{ marginBottom: 12 }}>
                {templates.map((t) => (
                  <Button key={t.code} href={'/admin/emergency?template=' + t.code} variant="ghost" size="sm">{t.name}</Button>
                ))}
              </div>
            )}
            <form method="post" action="/admin/emergency/broadcast">
              <Csrf />
              <Field label="Title" htmlFor="title">
                <Input id="title" name="title" required defaultValue={pre.title} />
              </Field>
              <Field label="Severity" htmlFor="severity">
                <Select id="severity" name="severity" options={enumOptions('Severity')} defaultValue={pre.severity} />
              </Field>
              <Field label="Content (English)" htmlFor="contentEn" full>
                <Textarea id="contentEn" name="contentEn" rows={3} required defaultValue={pre.contentEn} />
              </Field>
              <Field label="Content (中文)" htmlFor="contentZh" full>
                <Textarea id="contentZh" name="contentZh" rows={3} defaultValue={pre.contentZh} />
              </Field>
              <Button type="submit" variant="danger" icon="send">Broadcast to all (forced channels)</Button>
            </form>
          </Card>

          <Card title="Close">
            <form
              method="post"
              action="/admin/emergency/close"
              onSubmit={(e) => { if (!confirm('Close the emergency and return to normal routing?')) e.preventDefault(); }}
            >
              <Csrf />
              <Button type="submit">Close emergency</Button>
            </form>
          </Card>
        </>
      )}

      <Card title="Broadcast history" flush>
        {broadcasts.length === 0 ? (
          <EmptyState icon="bell" title="No emergency broadcasts yet." />
        ) : (
          <TableWrap>
            <thead>
              <tr><th>Time</th><th>Title</th><th>Recipients</th><th>Delivered/Attempts</th><th>Voice escalation</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {broadcasts.map((b) => (
                <tr key={b.id}>
                  <td className="nowrap muted small">{b.dispatchedAt}</td>
                  <td className="strong">{b.title}</td>
                  <td className="center">{b.recipients}</td>
                  <td className="center">{b.delivered + '/' + b.attempts}</td>
                  <td>
                    <form method="post" action="/admin/emergency/escalate" style={{ display: 'inline' }}>
                      <Csrf />
                      <input type="hidden" name="notificationId" value={b.id} />
                      <Button type="submit" size="sm">Run voice escalation</Button>
                    </form>
                  </td>
                  <td><a href={'/mgmt/notifications/' + b.id}>View log</a></td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <Button href="/admin/audit?filter=emergency" variant="ghost">View emergency audit log</Button>
      </div>
    </>
  );
}
