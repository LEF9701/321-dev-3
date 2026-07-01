# Smart Estate — React-island conversion playbook

You are converting Spring/Thymeleaf pages into React "islands". The Spring backend
is UNCHANGED. Each page = TWO files you author:

1. **React page**: `smart-estate/frontend/src/pages/<Name>.jsx`
2. **Template**: `smart-estate/src/main/resources/templates/<area>/<file>.html`
   (overwrite the existing Thymeleaf file with the thin island shell)

Pages self-register via a glob on `name`, so there is **no central registry to edit**.

## Ground truth
Before writing a page, **read the ORIGINAL template** (the file you will overwrite) and
its **controller** to get exact model-attribute names, field getters, form actions,
input names, and select options. The original template IS the precise data contract.
Controllers live in `smart-estate/src/main/java/com/smartestate/web/`.

## Reference files — mimic these exactly
- React page: `smart-estate/frontend/src/pages/ResidentDashboard.jsx`
- Template:   `smart-estate/src/main/resources/templates/resident/dashboard.html`
- Login (bare page, full forms): `smart-estate/frontend/src/pages/Login.jsx`

## ⛔ Do NOT edit shared files
Never modify: `styles.css`, `components/ui.jsx`, `components/Shell.jsx`, `lib/page.js`,
`lib/enums.js`, `lib/icons.jsx`, `App.jsx`, `main.jsx`, `fragments/island.html`, any
`.java`, `SecurityConfig`. Compose from what exists. If you need a one-off helper,
define it locally inside your page file. Do not add new icons — use existing names.

---

## Template shell (copy this idiom exactly)

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head th:replace="~{fragments/island :: head('PAGE TITLE')}"></head>
<body>
<div id="root"></div>
<th:block th:replace="~{fragments/island :: appctx}"></th:block>
<script th:inline="javascript">
    window.__PAGE__ = {
        name: 'unique-page-name',      // MUST match `export const name` in the .jsx
        title: 'Topbar Title',         // shown in the topbar; may be dynamic (see below)
        data: {
            // scalars:
            someCount: [[${someCount}]],
            // null-guarded object field (REQUIRED whenever the object may be null):
            unitCode: [[${unit != null ? unit.fullCode : null}]],
            // enum -> always inject .name() (NOT .label); UI maps to label/colour:
            status: [[${issue.status.name()}]],
            // date/time -> always pre-format to a string:
            created: [[${#temporals.format(issue.createdAt, 'yyyy-MM-dd HH:mm')}]],
            // money/number -> inject the raw number, render with hkd():
            balance: [[${unit != null ? unit.balance : null}]],
            // list -> inline iteration; trailing commas are fine:
            rows: [
                /*[# th:each="r : ${rows}"]*/
                {
                    id: [[${r.id}]],
                    name: [[${r.name}]],
                    role: [[${r.role.name()}]]
                },
                /*[/]*/
            ]
        }
    };
</script>
<script th:replace="~{fragments/island :: bundle}"></script>
</body>
</html>
```

### Template rules
- **Enums**: inject `xxx.name()` (e.g. `"OVERDUE"`). The UI converts to label + colour.
- **Dates/times**: always `#temporals.format(...)`. Use the SAME format the original used
  (commonly `'yyyy-MM-dd HH:mm'`, list views `'MM-dd HH:mm'`, full logs `'yyyy-MM-dd HH:mm:ss'`,
  dates only `'yyyy-MM-dd'`). For nullable dates: `[[${x.sentAt != null ? #temporals.format(x.sentAt,'HH:mm:ss') : null}]]`.
- **Null guard**: any object that can be null AND whose fields you read must be guarded:
  `[[${o != null ? o.field : null}]]`. Never write `[[${o.field}]]` if `o` may be null.
- **Money**: inject the raw `BigDecimal` number; render with `hkd()` in the page.
- **Dynamic topbar title** (e.g. "Issue RPT-0001"): set `title: [[${'Issue ' + issue.refNumber}]]`.
- For **select option lists** that come from the server (units, blocks, buildings, templates),
  inject them as arrays of `{value,label}` (or `{id, ...}`) and render `<option>`s in the page.
- For **enum select option lists**, do NOT inject — use `enumOptions('Type')` in the page.

---

## React page module contract

```jsx
import { data, user } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Card, /* ... */ } from '../components/ui.jsx';

export const name = 'unique-page-name';   // MUST match template
export const title = 'Topbar Title';       // optional; template `title` overrides it

export default function MyPage() {
  const d = data;
  return ( <> <PageHead title="..." /> ... </> );
}
```

Every content page (not login) is automatically wrapped in the app Shell (sidebar +
topbar + emergency banner). **Do NOT render your own sidebar/topbar.** Start your JSX
with `<PageHead .../>` then your cards.

---

## Helpers — `../lib/page.js`
- `data` — the injected `window.__PAGE__.data`
- `user` — `{ name, role }` (role: 'RESIDENT'|'MANAGEMENT'|'ADMIN')
- `activeEmergency`, `flash`, `csrf`
- `cx(...classes)` — join truthy classNames
- `hkd(n)` — `1234.5` → `"HK$ 1,234.50"`, null → `"—"`
- `initials(name)`, `pct(n)`

## Enums — `../lib/enums.js`
- `enumLabel(type, name)` → label string. e.g. `enumLabel('IssueStatus','IN_PROGRESS')` → "In Progress"
- `enumTone(type, name)` → 'ok'|'warn'|'danger'|'info'|'brand'|'muted'
- `enumOptions(type)` → `[{value,label}]` for `<select>`
- `ISSUE_STATUS_ORDER` → `['SUBMITTED','UNDER_REVIEW','IN_PROGRESS','RESOLVED']`
- Types: `Role, Language, FeeStatus, UnitStatus, Channel, Severity, NoticeCategory,
  DeliveryStatus, IssueStatus, IssueCategory, IssuePriority, EmergencyType`

## Components — `../components/ui.jsx`
```jsx
<PageHead title="..." sub="..." actions={<Button .../>} back={{href:'/x', label:'Back'}} />
<Card title="..." sub="..." icon="bell" actions={<Button.../>} flush>...</Card>   // flush = no body padding (use for tables)
<Stat label="Open issues" value={3} hint="..." tone="warn" icon="wrench" />
<Badge tone="ok">Paid</Badge>
<EnumBadge type="FeeStatus" value="OVERDUE" />     // tone+label auto from enum
<Button href="/x" variant="primary|danger|ghost" size="sm" icon="plus" iconRight="chevronRight">Label</Button>
<Button type="submit" variant="primary">Save</Button>   // no href => <button>
<Alert tone="ok|warn|danger|info">message</Alert>
<Flash flash={flash} />                              // renders server msg/error; put at top of content pages
<EmptyState icon="inbox" title="Nothing here">optional sub text / link</EmptyState>
<Bar pct={72} tone="ok" showLabel />
<Csrf />                                             // hidden CSRF input — put inside every POST <form>
<Field label="Email" hint="..." htmlFor="email" full>...</Field>
<Input id="email" name="email" type="email" required defaultValue={d.email} />
<Textarea name="content" rows={4} defaultValue={d.content} />
<Select name="role" options={enumOptions('Role')} defaultValue={d.role} includeEmpty emptyLabel="— none —" />
<TableWrap><thead>...</thead><tbody>...</tbody></TableWrap>   // styled <table class="tbl"> wrapper
<DL items={[['Reporter', d.reporter], ['Unit', d.unit || <span className="muted">—</span>]]} />
<Icon name="plus" size={16} />
```
Table cell helper classes: `className="num"` (right align), `"center"`, `"nowrap"`, `"strong"`, `"muted"`, `"mono"`, `"small"`.
Unread row marker: `<span className="unread-dot" />`.

## Icon names available
dashboard, inbox, bell, sliders, wrench, dollar, calendar, sparkles, building, map,
users, alert, clipboard, file, chart, shield, search, plus, trash, edit, logout, sun,
moon, menu, chevronRight, check, x, arrowLeft, send, home, phone, mail, doc, flame, history

---

## Forms — keep the existing backend working
Render a **real** `<form method="post" action="/exact/endpoint">` and put `<Csrf />` inside it.
This keeps Spring's controllers, redirects, flash messages and file uploads working as-is.

- File upload form: add `encType="multipart/form-data"` and a real `<input className="input" type="file" name="photo" accept="image/*" />`.
- A button with a different action (e.g. "Suggest with AI"): use `formAction="/other"` (and `formEncType` if it differs) on a submit button.
- Preselect a `<select>` with `defaultValue` (uncontrolled). Preserve the original option `value`s exactly.
- Inline action (delete/toggle) = a small `<form method="post" action="..." style={{display:'inline'}}>` with `<Csrf/>` and a `<Button size="sm" variant="danger">`. For confirmations use `onSubmit={(e)=>{ if(!confirm('…')) e.preventDefault(); }}`.
- GET filter form that auto-submits: `<form method="get"><Select onChange={(e)=>e.target.form.submit()} .../></form>`.
- Photos uploaded by residents are served at `/uploads/<filename>` — render `<img src={'/uploads/'+d.photo} style={{maxWidth:320, borderRadius:8, border:'1px solid var(--border)'}} />`.

## Consistency checklist (every page)
- Starts with `<PageHead .../>`; primary actions go in `PageHead actions`.
- Group content in `<Card>`s; tables live in `<Card flush>` with `<TableWrap>`.
- Statuses render as `<EnumBadge>` (never raw text).
- Empty lists render `<EmptyState>` (never a blank table).
- Money via `hkd()`. Dates already strings from the template.
- No hard-coded hex colours — only components / tokens. No `<style>` blocks except tiny inline layout (`style={{display:'flex',gap:12}}`).
- Detail/sub pages get a `back` link in `PageHead`.
