import { useState } from 'react';
import Icon from '../lib/icons.jsx';
import { data, csrf } from '../lib/page.js';
import { Alert } from '../components/ui.jsx';

export const name = 'login';
export const bare = true;

const DEMO = [
  { who: 'Admin', email: 'admin@smartestate.hk', pw: 'admin123' },
  { who: 'Management', email: 'manager@smartestate.hk', pw: 'manager123' },
  { who: 'Resident', email: 'resident@smartestate.hk', pw: 'resident123' },
  { who: 'Resident · overdue fee', email: 'wong@smartestate.hk', pw: 'resident123' },
  { who: 'Resident · elderly, voice', email: 'cheung@smartestate.hk', pw: 'resident123' },
];

const FEATURES = [
  'Multi-channel dispatch with per-resident routing',
  'Issue tracking with AI auto-categorisation',
  'Colour-coded floor map & emergency broadcast',
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="auth">
      <aside className="auth__aside">
        <div className="blob b1" /><div className="blob b2" />
        <div className="brandline"><span className="logo">🏢</span> Smart Estate</div>
        <div>
          <h2>Building management for Hong Kong residential estates.</h2>
          <p>Web-based management for Evergreen Bay Estate — six Trident blocks, multi-channel
             notifications, maintenance tracking and an AI bylaw assistant.</p>
        </div>
        <div className="auth__feats">
          {FEATURES.map((f) => (
            <div className="f" key={f}><Icon name="check" size={16} /> {f}</div>
          ))}
        </div>
      </aside>

      <div className="auth__main">
        <div className="auth__card">
          <h1>Sign in</h1>
          <div className="sub">Welcome back. Use a demo account below to explore a role.</div>

          {data.error && <Alert tone="danger">Invalid email or password.</Alert>}
          {data.logout && <Alert tone="ok">You have been logged out.</Alert>}

          <form method="post" action="/login">
            <input type="hidden" name={csrf.parameterName} value={csrf.token} />
            <div className="field">
              <label className="field__label" htmlFor="username">Email</label>
              <input className="input" id="username" name="username" type="text" autoFocus required
                     value={username} onChange={(e) => setUsername(e.target.value)}
                     placeholder="you@smartestate.hk" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="password">Password</label>
              <input className="input" id="password" name="password" type="password" required
                     value={password} onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••" />
            </div>
            <button className="btn btn--primary btn--block" type="submit">
              <Icon name="logout" size={16} /> Sign in
            </button>
          </form>

          <div className="demo-accounts">
            <div className="tag-key" style={{ marginBottom: 8 }}>Demo accounts — click to fill</div>
            {DEMO.map((d) => (
              <div className="da-row" key={d.email}
                   onClick={() => { setUsername(d.email); setPassword(d.pw); }}>
                <span className="who">{d.who}</span>
                <span className="cred">{d.email} · {d.pw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
