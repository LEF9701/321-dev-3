import { data } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, EnumBadge, EmptyState, TableWrap, Select, Field } from '../components/ui.jsx';

export const name = 'mgmt-issues';
export const title = 'Issue Tracking';

export default function MgmtIssues() {
  const d = data;
  const issues = d.issues || [];

  return (
    <>
      <PageHead title="Issue Tracking" sub="View, assign and update issue tickets. (FR-2.4 / FR-5.x)" />

      <Card>
        <form method="get">
          <Field label="Filter by status" htmlFor="status">
            <Select
              id="status"
              name="status"
              options={enumOptions('IssueStatus')}
              includeEmpty
              emptyLabel="All statuses"
              defaultValue={d.statusFilter || ''}
              onChange={(e) => e.target.form.submit()}
            />
          </Field>
        </form>
      </Card>

      <Card flush>
        {issues.length === 0
          ? <EmptyState icon="wrench" title="No issues found" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Reported</th>
                  <th>Unit</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((i) => (
                  <tr key={i.id}>
                    <td><a className="mono strong" href={`/mgmt/issues/${i.id}`}>{i.refNumber}</a></td>
                    <td className="nowrap muted small">{i.createdAt}</td>
                    <td>{i.unitFullCode || <span className="muted">—</span>}</td>
                    <td>{enumLabel('IssueCategory', i.category)}</td>
                    <td><EnumBadge type="IssuePriority" value={i.priority} /></td>
                    <td><EnumBadge type="IssueStatus" value={i.status} /></td>
                    <td>{i.assignedTo || <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
