import { data, flash } from '../lib/page.js';
import { PageHead, Card, Button, Field, Input, Csrf, Flash, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'admin-building-detail';

export default function AdminBuildingDetail() {
  const d = data;
  const building = d.building || {};
  const rows = d.rows || [];

  return (
    <>
      <PageHead
        title={building.name}
        sub={[building.address, building.district].filter(Boolean).join(' · ')}
        back={{ href: '/admin/buildings', label: 'Buildings' }}
      />

      <Flash flash={flash} />

      <Card title="Add a block" icon="building">
        <form method="post" action={'/admin/buildings/' + building.id + '/blocks'} className="stack">
          <Csrf />
          <Field label="Block name" htmlFor="blockName">
            <Input id="blockName" name="blockName" required />
          </Field>
          <Field label="Block type" htmlFor="blockType">
            <Input id="blockType" name="blockType" placeholder="e.g. Trident 1" />
          </Field>
          <div className="grid grid--2">
            <Field label="Floors to generate" htmlFor="floors">
              <Input id="floors" name="floors" type="number" defaultValue={0} min={0} max={60} />
            </Field>
            <Field label="Units per floor" htmlFor="unitsPerFloor">
              <Input id="unitsPerFloor" name="unitsPerFloor" type="number" defaultValue={0} min={0} max={40} />
            </Field>
          </div>
          <div>
            <Button type="submit" variant="primary" icon="plus">Add block</Button>
          </div>
        </form>
      </Card>

      <Card flush>
        {rows.length === 0
          ? <EmptyState icon="building" title="No blocks yet">Add a block above.</EmptyState>
          : (
            <TableWrap>
              <thead>
                <tr><th>Block</th><th>Type</th><th className="num">Floors</th><th className="num">Units</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><a className="strong" href={`/admin/blocks/${r.id}`}>{r.blockName}</a></td>
                    <td>{r.blockType || <span className="muted">—</span>}</td>
                    <td className="num">{r.floors}</td>
                    <td className="num">{r.units}</td>
                    <td className="right nowrap">
                      <Button href={`/admin/blocks/${r.id}`} size="sm" variant="ghost">Configure</Button>
                      {' '}
                      <form method="post" action={'/admin/blocks/' + r.id + '/delete'} style={{ display: 'inline' }}
                            onSubmit={(e) => { if (!confirm('Delete this block and all its floors/units?')) e.preventDefault(); }}>
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
