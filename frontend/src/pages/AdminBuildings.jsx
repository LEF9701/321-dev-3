import { data, flash } from '../lib/page.js';
import { PageHead, Card, Button, Field, Input, Csrf, Flash, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'admin-buildings';
export const title = 'Buildings';

export default function AdminBuildings() {
  const d = data;
  const rows = d.rows || [];

  return (
    <>
      <PageHead title="Buildings" />

      <Flash flash={flash} />

      <Card title="Register a building" icon="building">
        <form method="post" action="/admin/buildings" className="stack">
          <Csrf />
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" required />
          </Field>
          <Field label="Address" htmlFor="address">
            <Input id="address" name="address" />
          </Field>
          <Field label="District" htmlFor="district">
            <Input id="district" name="district" />
          </Field>
          <div>
            <Button type="submit" variant="primary" icon="plus">Register building</Button>
          </div>
        </form>
      </Card>

      <Card flush>
        {rows.length === 0
          ? <EmptyState icon="building" title="No buildings yet">Register one above to get started.</EmptyState>
          : (
            <TableWrap>
              <thead>
                <tr><th>Name</th><th>Address</th><th>District</th><th className="num">Blocks</th><th className="num">Units</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><a className="strong" href={`/admin/buildings/${r.id}`}>{r.name}</a></td>
                    <td>{r.address || <span className="muted">—</span>}</td>
                    <td>{r.district || <span className="muted">—</span>}</td>
                    <td className="num">{r.blocks}</td>
                    <td className="num">{r.units}</td>
                    <td className="right nowrap">
                      <Button href={`/admin/buildings/${r.id}`} size="sm" variant="ghost">Configure</Button>
                      {' '}
                      <form method="post" action={`/admin/buildings/${r.id}/delete`} style={{ display: 'inline' }}
                            onSubmit={(e) => { if (!confirm('Delete this building and ALL its blocks/floors/units?')) e.preventDefault(); }}>
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
