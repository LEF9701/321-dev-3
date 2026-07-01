import { data } from '../lib/page.js';
import { PageHead, Stat, Card, Icon } from '../components/ui.jsx';

export const name = 'admin-home';
export const title = 'Admin Home';

const NAV = [
  { href: '/admin/buildings', icon: 'building', title: 'Buildings & units', sub: 'Register and configure the estate' },
  { href: '/admin/floormap', icon: 'map', title: 'Floor Map', sub: 'Colour-coded occupancy view' },
  { href: '/admin/users', icon: 'users', title: 'Users & Roles', sub: 'Manage all accounts' },
  { href: '/admin/emergency', icon: 'alert', title: 'Emergency', sub: 'Declare, broadcast, escalate, close' },
  { href: '/admin/audit', icon: 'history', title: 'Audit Log', sub: 'Sensitive actions & compliance' },
];

export default function AdminHome() {
  const d = data;
  return (
    <>
      <PageHead title="Admin Home" />

      <div className="grid grid--4" style={{ marginBottom: 16 }}>
        <Stat label="Buildings" value={d.buildingCount ?? 0} icon="building" />
        <Stat label="Blocks" value={d.blockCount ?? 0} icon="building" />
        <Stat label="Units" value={d.unitCount ?? 0} icon="home" />
        <Stat label="Users" value={d.userCount ?? 0} icon="users" />
      </div>

      <Card title="Manage" icon="sliders">
        <div className="grid grid--auto">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="card"
               style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, textDecoration: 'none' }}>
              <div className="stat__icon"><Icon name={n.icon} size={20} /></div>
              <div>
                <div className="strong">{n.title}</div>
                <div className="sub">{n.sub}</div>
              </div>
              <div className="spacer" />
              <Icon name="chevronRight" size={16} />
            </a>
          ))}
        </div>
      </Card>
    </>
  );
}
