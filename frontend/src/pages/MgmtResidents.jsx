import { data } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Card, Button, EmptyState, TableWrap, Field, Input, Select, Csrf } from '../components/ui.jsx';

export const name = 'mgmt-residents';
export const title = 'Residents';

export default function MgmtResidents() {
  const d = data;
  const residents = d.residents || [];
  const blockOptions = (d.blocks || []).map((b) => ({ value: b.id, label: b.blockName }));

  return (
    <>
      <PageHead
        title="Residents"
        sub={`${residents.length} resident(s)`}
        actions={<Button href="/mgmt/residents/new" variant="primary" icon="plus">Add resident</Button>}
      />

      <Card>
        <form method="get" action="/mgmt/residents" className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Field label="Search">
            <Input name="q" defaultValue={d.q || ''} placeholder="Search name / email / phone" />
          </Field>
          <Field label="Block">
            <Select name="block" options={blockOptions} includeEmpty emptyLabel="All blocks"
                    defaultValue={d.blockFilter ?? ''} />
          </Field>
          <Button type="submit" variant="primary" icon="search">Search</Button>
          <Button href="/mgmt/residents" variant="ghost">Reset</Button>
        </form>
      </Card>

      <Card flush>
        {residents.length === 0
          ? <EmptyState icon="users" title="No residents found">Try a different search or <a href="/mgmt/residents/new">add a resident »</a></EmptyState>
          : (
            <TableWrap>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Unit</th><th>Language</th><th /></tr></thead>
              <tbody>
                {residents.map((r) => (
                  <tr key={r.id}>
                    <td className="strong">{r.name}</td>
                    <td className="muted">{r.email}</td>
                    <td className="muted">{r.phone}</td>
                    <td>{r.unitFullCode || <span className="muted">— unassigned —</span>}</td>
                    <td>{enumLabel('Language', r.language)}</td>
                    <td className="nowrap">
                      <Button href={`/mgmt/residents/${r.id}/edit`} size="sm" variant="ghost" icon="edit" />
                      <form method="post" action={`/mgmt/residents/${r.id}/delete`} style={{ display: 'inline' }}
                            onSubmit={(e) => { if (!confirm('Remove this resident?')) e.preventDefault(); }}>
                        <Csrf />
                        <Button type="submit" size="sm" variant="danger" icon="trash" />
                      </form>
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
