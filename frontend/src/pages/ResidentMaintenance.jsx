import { data } from '../lib/page.js';
import { PageHead, Card, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'resident-maintenance';
export const title = 'Maintenance Schedule';

export default function ResidentMaintenance() {
  const d = data;
  const schedules = d.schedules || [];

  return (
    <>
      <PageHead title="Maintenance Schedule" sub="Scheduled work that may affect your unit or the estate." />

      <Card flush>
        {schedules.length === 0
          ? <EmptyState icon="calendar" title="Nothing scheduled" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Work</th>
                  <th>Details</th>
                  <th>Affected scope</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={i}>
                    <td className="nowrap">{s.date}</td>
                    <td className="strong">{s.title}</td>
                    <td className="muted">{s.description}</td>
                    <td>{s.affectedScope}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
