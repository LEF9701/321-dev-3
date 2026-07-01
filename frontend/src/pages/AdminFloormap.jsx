import { data } from '../lib/page.js';
import { cx } from '../lib/page.js';
import { PageHead, Card, Stat, Bar, Select, EmptyState } from '../components/ui.jsx';

export const name = 'admin-floormap';
export const title = 'Floor Map';

const LEGEND = [
  { state: 'occupied', letter: 'O', label: 'Occupied' },
  { state: 'vacant', letter: 'V', label: 'Vacant' },
  { state: 'issue', letter: 'I', label: 'Open issue' },
  { state: 'overdue', letter: '$', label: 'Fee overdue' },
];

export default function AdminFloormap() {
  const d = data;
  const buildings = d.buildings || [];
  const maps = d.maps || [];

  return (
    <>
      <PageHead title="Floor Map" sub="Colour-coded grid per block. Click any unit to drill down." />

      <Card>
        <form method="get" action="/admin/floormap">
          <Select
            name="building"
            options={buildings.map((b) => ({ value: b.id, label: b.name }))}
            defaultValue={d.selectedBuilding ?? ''}
            onChange={(e) => e.target.form.submit()}
          />
        </form>
        <p className="legend" style={{ marginTop: 12 }}>
          {LEGEND.map((l) => (
            <span key={l.state} className="legend">
              <span className={cx('swatch', 'swatch--' + l.state)}>{l.letter}</span> {l.label}
            </span>
          ))}
        </p>
      </Card>

      {maps.length === 0 ? (
        <EmptyState icon="building" title="No blocks to display." />
      ) : (
        maps.map((bm) => (
          <Card key={bm.blockId} title={bm.blockName} sub={bm.blockType}>
            <div className="grid grid--auto" style={{ marginBottom: 16 }}>
              <Stat label="Total units" value={bm.totalUnits} />
              <Stat label="Occupied" value={bm.occupied} />
              <Stat label="Vacant" value={bm.vacant} />
              <Stat label="Open issues" value={bm.openIssues} tone={bm.openIssues > 0 ? 'warn' : undefined} />
              <Stat label="Fee overdue" value={bm.overdue} tone={bm.overdue > 0 ? 'danger' : undefined} />
              <Stat label="Occupancy" value={<Bar pct={bm.occupancyPct} showLabel />} />
            </div>

            <div className="floormap">
              {(bm.rows || []).map((row) => (
                <div className="floor-row" key={row.floorNumber}>
                  <div className="floor-label">{row.floorNumber}/F</div>
                  {(row.cells || []).map((cell) => (
                    <a
                      key={cell.unitId}
                      className={cx('cell', 'cell--' + cell.state)}
                      href={'/admin/units/' + cell.unitId}
                      title={cell.stateLabel + (cell.occupant ? ' — ' + cell.occupant : '')}
                    >
                      <span className="letter">{cell.letter}</span>
                      <span className="code">{cell.unitCode}</span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </>
  );
}
