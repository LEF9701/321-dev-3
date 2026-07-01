import { useEffect, useState } from 'react';
import Icon from '../lib/icons.jsx';
import { cx, csrf, user, activeEmergency, initials } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';

/* ---- role-aware navigation (mirrors the old fragments/common.html) ---- */
const NAV = {
  RESIDENT: [
    { group: 'Resident', items: [
      { label: 'Dashboard', href: '/resident', icon: 'dashboard' },
      { label: 'Inbox', href: '/resident/inbox', icon: 'inbox' },
      { label: 'Preferences', href: '/resident/preferences', icon: 'sliders' },
      { label: 'Report / Track Issue', href: '/resident/issues', icon: 'wrench' },
      { label: 'Fees', href: '/resident/fees', icon: 'dollar' },
      { label: 'Maintenance', href: '/resident/maintenance', icon: 'calendar' },
      { label: 'AI Assistant', href: '/ai/chat', icon: 'sparkles' },
    ]},
  ],
  MANAGEMENT: [
    { group: 'Management', items: [
      { label: 'Overview', href: '/mgmt', icon: 'dashboard' },
      { label: 'Residents', href: '/mgmt/residents', icon: 'users' },
      { label: 'Notifications', href: '/mgmt/notifications', icon: 'bell' },
      { label: 'Analytics', href: '/mgmt/analytics', icon: 'chart' },
      { label: 'Issues', href: '/mgmt/issues', icon: 'wrench' },
      { label: 'Fees', href: '/mgmt/fees', icon: 'dollar' },
      { label: 'AI Assistant', href: '/ai/chat', icon: 'sparkles' },
      { label: 'AI Evaluation', href: '/ai/evaluation', icon: 'check' },
    ]},
  ],
  ADMIN_EXTRA: [
    { group: 'Administration', items: [
      { label: 'Admin Home', href: '/admin', icon: 'home' },
      { label: 'Buildings', href: '/admin/buildings', icon: 'building',
        paths: ['/admin/buildings', '/admin/blocks', '/admin/units', '/admin/floors'] },
      { label: 'Floor Map', href: '/admin/floormap', icon: 'map' },
      { label: 'Users & Roles', href: '/admin/users', icon: 'users' },
      { label: 'Emergency', href: '/admin/emergency', icon: 'alert' },
      { label: 'Audit Log', href: '/admin/audit', icon: 'history' },
      { label: 'AI Documents', href: '/ai/documents', icon: 'file' },
    ]},
  ],
};

function navForRole(role) {
  if (role === 'RESIDENT') return NAV.RESIDENT;
  if (role === 'MANAGEMENT') return NAV.MANAGEMENT;
  if (role === 'ADMIN') return [...NAV.MANAGEMENT, ...NAV.ADMIN_EXTRA];
  return [];
}

// Longest-prefix wins so /resident matches Dashboard but /resident/inbox matches Inbox.
function activeHref(groups, path) {
  let best = null, bestLen = -1;
  for (const g of groups) for (const it of g.items) {
    for (const p of (it.paths || [it.href])) {
      if ((path === p || path.startsWith(p + '/') || (p === path)) && p.length > bestLen) {
        best = it.href; bestLen = p.length;
      }
    }
  }
  return best;
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('se-theme');
    if (saved) return saved;
    return (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('se-theme', theme); } catch {}
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

function Sidebar({ groups, path, onNavigate }) {
  const active = activeHref(groups, path);
  return (
    <aside className="sidebar">
      <a className="sidebar__brand" href="/">
        <span className="logo">🏢</span>
        <span>Smart Estate<small>Evergreen Bay Estate · BMS</small></span>
      </a>
      <nav className="sidebar__nav">
        {groups.map((g) => (
          <div className="nav-group" key={g.group}>
            <div className="nav-group__label">{g.group}</div>
            {g.items.map((it) => (
              <a key={it.href} href={it.href} onClick={onNavigate}
                 className={cx('nav-link', active === it.href && 'is-active')}>
                <Icon name={it.icon} size={18} className="ico" />
                <span>{it.label}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar__foot">CSIT321 prototype · external channels mocked</div>
    </aside>
  );
}

function EmergencyBanner() {
  if (!activeEmergency) return null;
  return (
    <div className="emergency-banner">
      <span className="pulse" />
      <span>
        <strong>EMERGENCY ACTIVE — {enumLabel('EmergencyType', activeEmergency.type)}</strong>
        {' '}declared {activeEmergency.declaredAt} by {activeEmergency.declaredBy}.
      </span>
      {user?.role === 'ADMIN' && <a href="/admin/emergency" style={{ marginLeft: 'auto' }}>Manage ›</a>}
    </div>
  );
}

export default function Shell({ title, sub, children }) {
  const [theme, toggleTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const path = typeof location !== 'undefined' ? location.pathname : '/';
  const groups = navForRole(user?.role);

  return (
    <div className={cx('app', navOpen && 'nav-open')}>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <Sidebar groups={groups} path={path} onNavigate={() => setNavOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="iconbtn topbar__hamburger" onClick={() => setNavOpen((v) => !v)} aria-label="Menu">
            <Icon name="menu" size={20} />
          </button>
          <div className="topbar__title">{title}{sub && <small>{sub}</small>}</div>
          <div className="topbar__spacer" />
          <button className="iconbtn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          {user && (
            <div className="user-chip">
              <div className="avatar">{initials(user.name)}</div>
              <div className="user-chip__meta">
                <div className="name">{user.name}</div>
                <div className="muted small">{enumLabel('Role', user.role)}</div>
              </div>
              <form method="post" action="/logout" style={{ display: 'inline' }}>
                <input type="hidden" name={csrf.parameterName} value={csrf.token} />
                <button className="iconbtn" type="submit" aria-label="Log out" title="Log out">
                  <Icon name="logout" size={18} />
                </button>
              </form>
            </div>
          )}
        </header>
        <EmergencyBanner />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
