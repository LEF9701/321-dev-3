// Shared UI primitives used by every page, so the whole app stays consistent.
import Icon from '../lib/icons.jsx';
import { cx, csrf } from '../lib/page.js';
import { enumLabel, enumTone } from '../lib/enums.js';

/* ---- page header ---- */
export function PageHead({ title, sub, actions, back }) {
  return (
    <div className="page-head row--between row" style={{ alignItems: 'flex-start' }}>
      <div>
        {back && (
          <a className="btn btn--ghost btn--sm" href={back.href} style={{ marginBottom: 8, marginLeft: -8 }}>
            <Icon name="arrowLeft" size={15} /> {back.label || 'Back'}
          </a>
        )}
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {actions && <div className="btn-row">{actions}</div>}
    </div>
  );
}

/* ---- card ---- */
export function Card({ title, sub, icon, actions, children, flush, className, ...rest }) {
  return (
    <section className={cx('card', className)} {...rest}>
      {(title || actions) && (
        <header className="card__head">
          {icon && <Icon name={icon} size={18} />}
          <div>
            {title && <h2>{title}</h2>}
            {sub && <div className="sub">{sub}</div>}
          </div>
          <div className="spacer" />
          {actions}
        </header>
      )}
      <div className={cx('card__body', flush && 'card__body--flush')}>{children}</div>
    </section>
  );
}

/* ---- KPI stat ---- */
export function Stat({ label, value, hint, tone, icon }) {
  return (
    <div className={cx('stat', tone && `stat--${tone}`)}>
      <div className="stat__top">
        <div style={{ flex: 1 }}>
          <div className="stat__label">{label}</div>
          <div className="stat__value">{value}</div>
        </div>
        {icon && <div className="stat__icon"><Icon name={icon} size={19} /></div>}
      </div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}

/* ---- badge ---- */
export function Badge({ tone = 'muted', children, dot }) {
  return (
    <span className={cx('badge', tone && `badge--${tone}`)}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

// Badge straight from an enum NAME, e.g. <EnumBadge type="FeeStatus" value="OVERDUE" />
export function EnumBadge({ type, value, dot = true }) {
  if (value == null || value === '') return <span className="muted">—</span>;
  return <Badge tone={enumTone(type, value)} dot={dot}>{enumLabel(type, value)}</Badge>;
}

/* ---- button (renders <a> when href is given) ---- */
export function Button({ as, href, variant, size, block, icon, iconRight, children, className, ...rest }) {
  const cn = cx('btn', variant && `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className);
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 16} />}
    </>
  );
  if (href) return <a className={cn} href={href} {...rest}>{inner}</a>;
  const Tag = as || 'button';
  return <Tag className={cn} {...rest}>{inner}</Tag>;
}

/* ---- alerts ---- */
export function Alert({ tone = 'info', icon, children }) {
  const def = { ok: 'check', warn: 'alert', danger: 'alert', info: 'bell' };
  return (
    <div className={cx('alert', tone && `alert--${tone}`)}>
      <span className="alert__icon"><Icon name={icon || def[tone]} size={17} /></span>
      <div>{children}</div>
    </div>
  );
}

// Renders flash msg / error coming from the server (Spring RedirectAttributes).
export function Flash({ flash }) {
  if (!flash) return null;
  return (
    <>
      {flash.msg && <Alert tone="ok">{flash.msg}</Alert>}
      {flash.error && <Alert tone="danger">{flash.error}</Alert>}
    </>
  );
}

export function EmptyState({ icon = 'inbox', title, children }) {
  return (
    <div className="empty">
      <div className="empty__icon"><Icon name={icon} size={30} /></div>
      {title && <div className="empty__title">{title}</div>}
      {children && <div className="small muted" style={{ marginTop: 4 }}>{children}</div>}
    </div>
  );
}

/* ---- progress bar ---- */
export function Bar({ pct = 0, tone, showLabel }) {
  const w = Math.max(0, Math.min(100, pct || 0));
  const bar = (
    <div className={cx('bar', tone && `bar--${tone}`)}>
      <span style={{ width: w + '%' }} />
    </div>
  );
  if (!showLabel) return bar;
  return <div className="bar-label">{bar}<span className="val">{Math.round(w)}%</span></div>;
}

/* ---- forms ---- */
export function Csrf() {
  return <input type="hidden" name={csrf.parameterName} value={csrf.token} />;
}

export function Field({ label, hint, htmlFor, children, full }) {
  return (
    <div className={cx('field', full && 'field--full')}>
      {label && <label className="field__label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}

export function Input(props) { return <input className={cx('input', props.className)} {...props} />; }
export function Textarea(props) { return <textarea className={cx('textarea', props.className)} {...props} />; }

export function Select({ options, placeholder, includeEmpty, emptyLabel = '—', children, ...rest }) {
  return (
    <select className="select" {...rest}>
      {includeEmpty && <option value="">{emptyLabel}</option>}
      {options
        ? options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)
        : children}
    </select>
  );
}

/* ---- table wrapper ---- */
export function TableWrap({ children }) {
  return <div className="table-wrap"><table className="tbl">{children}</table></div>;
}

/* ---- key/value detail list ---- */
export function DL({ items }) {
  return (
    <dl className="dl">
      {items.filter(Boolean).map(([k, v], i) => (
        <div key={i} style={{ display: 'contents' }}>
          <dt>{k}</dt>
          <dd>{v ?? <span className="muted">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export { Icon };
