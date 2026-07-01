import { data, flash, cx } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Card, Button, Field, Input, Csrf, Flash, EmptyState } from '../components/ui.jsx';

export const name = 'admin-block-detail';

export default function AdminBlockDetail() {
  const d = data;
  const block = d.block || {};
  const floors = d.floors || [];

  return (
    <>
      <PageHead
        title={block.blockName}
        sub={block.blockType}
        back={{ href: '/admin/buildings/' + block.buildingId, label: 'Building' }}
      />

      <Flash flash={flash} />

      <Card title="Add a floor" icon="building">
        <form method="post" action={'/admin/blocks/' + block.id + '/floors'} className="stack">
          <Csrf />
          <div className="grid grid--2">
            <Field label="Floor number" htmlFor="floorNumber">
              <Input id="floorNumber" name="floorNumber" type="number" required />
            </Field>
            <Field label="Units to generate" htmlFor="unitsPerFloor">
              <Input id="unitsPerFloor" name="unitsPerFloor" type="number" defaultValue={6} min={0} max={40} />
            </Field>
          </div>
          <div>
            <Button type="submit" variant="primary" icon="plus">Add floor</Button>
          </div>
        </form>
      </Card>

      <Card title="Legend">
        <div className="legend">
          <span className="item"><span className="swatch swatch--vacant" /> V — Vacant</span>
          <span className="item"><span className="swatch swatch--occupied" /> O — Occupied</span>
        </div>
      </Card>

      {floors.length === 0
        ? <Card><EmptyState icon="building" title="No floors yet">Add a floor above.</EmptyState></Card>
        : floors.map((floor) => (
          <Card
            key={floor.id}
            title={floor.floorNumber + '/F'}
            actions={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <form method="post" action={'/admin/floors/' + floor.id + '/units'} style={{ display: 'inline-flex', gap: 6 }}>
                  <Csrf />
                  <Input name="unitCode" size={6} placeholder="unit code" required />
                  <Button type="submit" size="sm" icon="plus">add unit</Button>
                </form>
                <form method="post" action={'/admin/floors/' + floor.id + '/delete'} style={{ display: 'inline' }}
                      onSubmit={(e) => { if (!confirm('Delete this floor and its units?')) e.preventDefault(); }}>
                  <Csrf />
                  <Button type="submit" size="sm" variant="danger" icon="trash" />
                </form>
              </div>
            }
          >
            {(floor.units || []).length === 0
              ? <span className="muted small">No units on this floor.</span>
              : (
                <div className="floor-row" style={{ flexWrap: 'wrap' }}>
                  {floor.units.map((unit) => (
                    <a
                      key={unit.id}
                      className={cx('cell', 'cell--' + (unit.status === 'OCCUPIED' ? 'occupied' : 'vacant'))}
                      href={'/admin/units/' + unit.id}
                      title={unit.unitCode + ' — ' + enumLabel('UnitStatus', unit.status)}
                    >
                      <span className="letter">{unit.status === 'OCCUPIED' ? 'O' : 'V'}</span>
                      <span className="code">{unit.unitCode}</span>
                    </a>
                  ))}
                </div>
              )}
          </Card>
        ))}
    </>
  );
}
