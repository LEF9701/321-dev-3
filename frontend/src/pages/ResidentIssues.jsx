import { data } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Card, EnumBadge, Button, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'resident-issues';
export const title = 'My Issues';

export default function ResidentIssues() {
  const d = data;
  const issues = d.issues || [];

  return (
    <>
      <PageHead title="My Issues"
                sub="Maintenance issues you have reported and their current status."
                actions={<Button href="/resident/issues/new" variant="primary" icon="plus">Report an issue</Button>} />

      <Card flush>
        {issues.length === 0
          ? <EmptyState icon="wrench" title="You have not reported any issues yet">
              <a href="/resident/issues/new">Report one »</a>
            </EmptyState>
          : (
            <TableWrap>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Reported</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned to</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {issues.map((i) => (
                  <tr key={i.id}>
                    <td><a className="mono strong" href={`/resident/issues/${i.id}`}>{i.refNumber}</a></td>
                    <td className="nowrap muted small">{i.createdAt}</td>
                    <td>{enumLabel('IssueCategory', i.category)}</td>
                    <td><EnumBadge type="IssueStatus" value={i.status} /></td>
                    <td><EnumBadge type="IssuePriority" value={i.priority} /></td>
                    <td>{i.assignedTo || <span className="muted">—</span>}</td>
                    <td className="right">
                      <Button href={`/resident/issues/${i.id}`} variant="ghost" size="sm" iconRight="chevronRight">View</Button>
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
