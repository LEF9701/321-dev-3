import { data, flash } from '../lib/page.js';
import { PageHead, Card, Badge, EnumBadge, Button, EmptyState, TableWrap, Csrf, Flash } from '../components/ui.jsx';

export const name = 'admin-users';
export const title = 'Users & Roles';

export default function AdminUsers() {
  const users = data.users || [];

  return (
    <>
      <PageHead
        title="Users & Roles"
        sub="Manage accounts and role assignments."
        actions={<Button href="/admin/users/new" variant="primary" icon="plus">Add user</Button>}
      />

      <Flash flash={flash} />

      <Card flush>
        {users.length === 0 ? (
          <EmptyState icon="users" title="No users yet" />
        ) : (
          <TableWrap>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Unit</th><th>Enabled</th><th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="strong">{u.name}</td>
                  <td className="mono small">{u.email}</td>
                  <td><EnumBadge type="Role" value={u.role} /></td>
                  <td>{u.unitFullCode || <span className="muted">—</span>}</td>
                  <td>{u.enabled ? <Badge tone="ok">Yes</Badge> : <Badge tone="muted">No</Badge>}</td>
                  <td className="nowrap">
                    <Button href={'/admin/users/' + u.id + '/edit'} size="sm" variant="ghost" icon="edit">Edit</Button>
                    {' '}
                    <form method="post" action={'/admin/users/' + u.id + '/toggle'} style={{ display: 'inline' }}>
                      <Csrf />
                      <Button type="submit" size="sm">{u.enabled ? 'Disable' : 'Enable'}</Button>
                    </form>
                    {' '}
                    <form
                      method="post"
                      action={'/admin/users/' + u.id + '/delete'}
                      style={{ display: 'inline' }}
                      onSubmit={(e) => { if (!confirm('Delete this user?')) e.preventDefault(); }}
                    >
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
