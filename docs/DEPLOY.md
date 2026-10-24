# Deploying Suhayl

Suhayl ships as one Docker image. The Express server serves the API under `/api` and the built React app for every other path, so a single container on one domain is enough.

The server checks its settings when it starts. In production (`NODE_ENV=production`, which the image sets) it refuses to start, and lists what is missing, when:

- `JWT_SECRET` is shorter than 32 bytes or still a placeholder (this check also runs in development)
- `MONGODB_URI`, `CORS_ORIGINS` or `APP_URL` is not set
- `STORAGE_DRIVER=s3` is set but the bucket or keys are missing

It also prints a warning when email is off or uploads are kept on local disk.

## What you need before you start

| What | Why | Options |
| --- | --- | --- |
| A server or container host | Runs the image | A VPS with Docker (Hetzner, OVH, DigitalOcean), or Render, Railway, Fly.io |
| MongoDB | Every record | MongoDB Atlas (a free M0 cluster is enough to start), or the `mongo` service in `docker-compose.yml` |
| File storage | Documents families upload through their link | An S3-compatible bucket (Cloudflare R2 has no egress fees), or a persistent disk |
| SMTP | Password resets, team invites, document requests to families | Brevo, Postmark, Amazon SES, Mailgun, or a Google Workspace mailbox |
| A domain with HTTPS | Links in emails point here | Any registrar. Put Caddy, nginx or the host's proxy in front of the container |
| Sentry (optional) | Error reports | A free Sentry project. Set `SENTRY_DSN` and `VITE_SENTRY_DSN` |
| Google sign-in (optional) | The "Continue with Google" button | An OAuth client in Google Cloud. Set `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` |

## Settings

Copy `.env.example` to `.env` and fill it in. Each variable is explained there. The ones that matter most:

```
NODE_ENV=production
JWT_SECRET=<openssl rand -hex 32>
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=<12+ characters, mixed case, digits or symbols>
ALLOW_BOOTSTRAP_ADMIN=true   # first start only; remove all three afterwards
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/suhayl
APP_URL=https://app.example.com
CORS_ORIGINS=https://app.example.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM="Suhayl" <hello@example.com>
STORAGE_DRIVER=s3
S3_BUCKET=suhayl-documents
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

`VITE_GOOGLE_CLIENT_ID` and `VITE_SENTRY_DSN` are built into the web app, so they are passed when the image is **built**, not when it runs. `docker compose` reads them from `.env` for you. With plain `docker build`, pass them with `--build-arg`.

## Option A: one machine with docker compose

This runs the app and its own MongoDB, with uploads and data on named volumes.

```bash
cp .env.example .env
docker compose up -d --build
docker compose logs -f app
```

`MONGODB_URI` defaults to the bundled `mongo` service. Set it in `.env` to use Atlas instead, and remove the `mongo` service if you no longer need it.

Then put a reverse proxy with HTTPS in front of port 5000. With Caddy, a whole `Caddyfile` is:

```
app.example.com {
  reverse_proxy localhost:5000
}
```

Back up the `mongo-data` volume (or use Atlas backups). If you keep `STORAGE_DRIVER=local`, back up the `uploads` volume too.

## Option B: a container host (Render, Railway, Fly.io)

1. Point the service at this repository and let it build the `Dockerfile`.
2. Add the settings above as environment variables, plus `VITE_*` as build variables.
3. Use MongoDB Atlas and an S3/R2 bucket. These hosts usually wipe the container's disk on each deploy, so local uploads would be lost.
4. Set the health check path to `/api/health`. It returns 200 when the database is reachable and 503 when it isn't.

## After the first deploy

- Open `/api/health`. It should report `"db": "up"`.
- Register an agency account, invite a counsellor and check that the invite email arrives.
- Turn on a family link for a test student, upload a file through it, and download it again from the agency side.
- Ask for a password reset and check that the link opens your `APP_URL`.

## Running more than one instance

Sessions are stateless JWTs and rate-limit counters live in MongoDB, so you can run several containers behind a load balancer. Use `STORAGE_DRIVER=s3` in that case, because local uploads exist only on the instance that received them.

## Before real customers

- `/privacy` and `/terms` are drafts. Have them reviewed for the countries you operate in (Algerian law 18-07 and, for EU-based students or partners, the GDPR) before launch.
- Sign a data processing agreement with each provider that holds student data: database, storage, email and Sentry.
- There is no billing yet. Agencies are not charged anywhere in the app.
