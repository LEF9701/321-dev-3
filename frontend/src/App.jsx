import { PAGE, user } from './lib/page.js';
import Shell from './components/Shell.jsx';

// Pages self-register: each module under pages/ exports `name` (matching the
// server-injected PAGE.name) and a default component. No central registry to
// edit, so pages can be added in parallel without conflicts.
const modules = import.meta.glob('./pages/**/*.jsx', { eager: true });
const registry = {};
for (const m of Object.values(modules)) {
  if (m && m.name && m.default) registry[m.name] = m;
}

export default function App() {
  const mod = registry[PAGE.name];

  if (!mod) {
    return (
      <Shell title="Page not found">
        <div className="card"><div className="card__body">
          No React page is registered for <code>{String(PAGE.name)}</code>.
        </div></div>
      </Shell>
    );
  }

  const Page = mod.default;
  // `bare` pages (login) render their own full-screen layout, no app chrome.
  if (mod.bare || !user) return <Page />;
  return (
    <Shell title={PAGE.title || mod.title || ''} sub={PAGE.sub}>
      <Page />
    </Shell>
  );
}
