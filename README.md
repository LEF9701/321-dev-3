# Smart Estate

A web-based **building-management system** for Hong Kong residential estates, built as a CSIT321
capstone prototype. It ships with a fictional demo estate — **Evergreen Bay Estate** (six towers) —
and demonstrates multi-channel notifications, issue tracking, a colour-coded floor map, emergency
broadcast, fee management, and an AI bylaw assistant.

External messaging channels (SMS / WhatsApp / Email / Voice) run through a **config-driven AWS
dispatcher**, and fall back to a built-in mock engine when AWS is not configured — so the whole app
runs and demos fully offline out of the box.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17 · Spring Boot 3.3.5 (Spring MVC, Spring Data JPA, Spring Security) |
| Frontend | **React 18 + Vite "islands"** rendered on top of Thymeleaf views (modern dashboard UI, light/dark, responsive) |
| Database | H2 in-memory (seeded on every startup) |
| Auth | Session-based form login · BCrypt · URL-level RBAC (Resident / Management / Admin) |
| Messaging | AWS End User Messaging **SMS**/**Voice**, Amazon **SES** (email), End User Messaging **Social** (WhatsApp) — config-driven, with a mock fallback |
| AI | In-house TF-IDF retrieval + k-NN classifier (offline) · optional Anthropic **Claude** (`claude-opus-4-8`) |

---

## Quick start (one command)

```bash
cd smart-estate
./run.sh
```
Open **http://localhost:8080**. `run.sh` builds the React bundle (only if its sources changed),
pins JDK 17, and launches via the Maven wrapper. First run downloads Maven + npm dependencies.

Alternatively:
```bash
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw spring-boot:run
# or build a runnable jar (the React bundle is committed, so this alone is enough):
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw clean package
java -jar target/smart-estate.jar
```

### Demo accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartestate.hk` | `admin123` |
| Management | `manager@smartestate.hk` | `manager123` |

> **Residents are not seeded by default** (privacy). The floor map starts fully vacant and Fees is
> empty until you add residents/units in the UI. For a *populated* local demo, seed the fictional
> residents with `--app.seed.residents=true` (adds ~48 demo residents, all password `resident123`,
> e.g. `resident@smartestate.hk`). Never enable this on a public deployment.

H2 console (dev only): **http://localhost:8080/h2-console** — JDBC `jdbc:h2:mem:smartestate`, user `sa`, no password.

---

## Features

- **Multi-channel notifications (FR-1)** — per-resident channel preference routing, delivery status
  + read receipts, scheduled sending, batch-by-block.
- **Management dashboard (FR-2)** — resident database (search / filter / CRUD), notification history
  & delivery analytics, announcement compose **+ edit**, issue tracking, per-unit fee management.
- **Resident dashboard (FR-3)** — inbox, communication preferences, issue reporting with photo,
  fee status, maintenance schedule.
- **Building & floor map (FR-4)** — register buildings/blocks/floors/units, colour-coded floor map
  with drill-down and per-tower occupancy summary.
- **Issue management (FR-5)** — auto tracking number, status workflow, priority, resident↔management
  comment thread, resident withdraw.
- **HK templates (FR-6)** — Observatory alerts, bilingual BMO meeting notices, automated fee
  reminders with overdue escalation, service-interruption alerts.
- **Emergency (FR-7)** — declare, forced multi-channel broadcast, voice escalation, audit log, close.
- **AI assistant (FR-8)** — bilingual bylaw/FAQ chatbot (TF-IDF RAG, optional Claude), document
  ingestion + re-index, issue auto-categorisation (k-NN), evaluation page.

Enabled channels are configurable — the app currently ships **SMS-only** (`app.channels.enabled=SMS`);
the resident preferences UI shows the other channels as disabled.

---

## Configuration

All behaviour is driven by `src/main/resources/application.properties` and can be overridden per
deployment via environment variables (Spring relaxed binding). **Secrets and account-specific
identifiers are never committed** — supply them at runtime.

### Enable AWS messaging (SMS / Voice / SES / WhatsApp)
The repo default is **off** (mock engine). To route real messages, provide credentials + identities
via env (e.g. in a systemd `EnvironmentFile`):

```bash
APP_AWS_MESSAGING_ENABLED=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
# SMS origination (phone-number ARN, pool id, or sender id):
APP_AWS_MESSAGING_SMS_ORIGINATIONIDENTITY=arn:aws:sms-voice:ap-southeast-1:<acct>:sender-id/<id>/HK
# (SES: APP_AWS_MESSAGING_EMAIL_FROM=... ; WhatsApp: APP_AWS_MESSAGING_WHATSAPP_ORIGINATIONPHONENUMBERID=...)
```
The IAM principal needs `sms-voice:SendTextMessage`, `sms-voice:SendVoiceMessage`, `ses:SendEmail`,
`social-messaging:SendWhatsAppMessage`. Channel → AWS service mapping lives in
`config/AwsMessagingProperties.java`.

### Enable Claude (AI answer generation)
Claude is used only when a key is present; otherwise the local TF-IDF engine answers.
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Deploying to AWS Lightsail (summary)

1. `./mvnw clean package` → `target/smart-estate.jar` (contains the React bundle).
2. `scp` the jar to the instance; install `openjdk-17-jre-headless`.
3. Put secrets in a root-only `EnvironmentFile` (`/etc/smartestate.env`, `chmod 600`).
4. Run as a `systemd` service (`ExecStart=/usr/bin/java -jar /opt/smartestate/smart-estate.jar`,
   `EnvironmentFile=/etc/smartestate.env`), then `systemctl enable --now smartestate`.
5. Put **nginx + HTTPS** in front and keep port 8080 closed.

### Security notes for real deployments
- Change the default `admin` / `manager` passwords.
- Set `spring.h2.console.enabled=false`.
- Terminate TLS at a reverse proxy (no plain HTTP).
- Keep `app.seed.residents=false` (no PII) in production.

---

## Frontend (React islands)

The UI is a Vite + React app in [`frontend/`](frontend/), rendered as per-page *islands*: each Spring
controller returns a thin Thymeleaf view that injects its data as JSON (`window.__APP__` /
`window.__PAGE__`) and mounts a React component. Backend routes, auth, CSRF and file uploads are
unchanged; forms still POST to the same endpoints.

```bash
cd frontend
npm install          # once
npm run build        # → ../src/main/resources/static/app/{smart-estate.js,.css}
npm run dev          # optional: Vite dev server with mock data (?page=<name>)
```
The build output is committed under `src/main/resources/static/app/`, so the app runs without Node.

---

## Project structure
```
smart-estate/
├── src/main/java/com/smartestate/
│   ├── web/            # controllers (Home/Auth, Admin, Emergency, Management, Resident, Ai, File)
│   ├── service/        # dispatch, recipients, emergency, fees, issues, floor map, audit, scheduler
│   ├── messaging/      # config-driven AWS senders (SMS/Voice/SES/WhatsApp) + mock fallback
│   ├── ai/             # RAG (TF-IDF), k-NN classifier, evaluation, Claude client
│   ├── model/ · repo/  # JPA entities + repositories
│   ├── config/         # security, AWS + channel policy config
│   └── seed/           # in-memory demo data seeder
├── src/main/resources/
│   ├── templates/      # Thymeleaf island shells (per page)
│   └── static/app/     # committed React bundle
├── frontend/           # React 18 + Vite source
├── run.sh · pom.xml · mvnw
```

## Notes
- H2 is in-memory: data resets on restart. CRUD edits persist within a single run.
- External SMS / WhatsApp / Email / Voice are **mocked** unless AWS is configured; each "send" is
  otherwise recorded as a delivery-log row with a simulated status.
