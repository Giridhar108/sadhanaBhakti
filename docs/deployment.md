# Production deployment

The production stack consists of three Docker services:

- `postgres`: PostgreSQL with a persistent Docker volume;
- `api`: NestJS, Prisma migrations and a persistent audio volume;
- `web`: the compiled Vite application served by Nginx, with `/api` proxied to `api`.

Only `web` is published on the host, at `127.0.0.1:8080` by default. Host-level
Nginx accepts public traffic and provides HTTPS. PostgreSQL and the API are not
exposed directly to the internet. Redis is not included because the application
does not currently use it.

## Server requirements

- A Linux VPS with Docker Engine and the Docker Compose plugin.
- Nginx and Certbot installed on the host.
- A domain with its `A` record pointing to the VPS.
- Ports `80` and `443` open in the firewall. Restrict SSH to trusted addresses
  when possible; do not open PostgreSQL port `5432`.

For a small first deployment, 2 CPU cores, 2-4 GB RAM and 20+ GB SSD is a
reasonable starting point. Increase disk space according to uploaded audio.

## First deployment

Clone the repository into a stable directory, for example `/opt/hare-krishna`,
then create the production environment file:

```bash
cd /opt/hare-krishna
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -hex 32
openssl rand -hex 64
openssl rand -hex 64
```

Put the generated values into `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET` and
`JWT_REFRESH_SECRET`. Set `FRONTEND_URL` to the final HTTPS origin, without a
trailing slash, for example `https://practice.example.com`. Use hexadecimal
database passwords so the generated Prisma connection URL does not require URL
encoding.

Validate and start the stack:

```bash
chmod +x deploy/deploy.sh deploy/backup.sh
./deploy/deploy.sh
```

The script validates Compose configuration, pulls/builds images, waits for
PostgreSQL, applies `prisma migrate deploy`, starts the services and verifies
`/api/health`. It is safe to run again for later releases.

## Public Nginx and HTTPS

Copy `deploy/nginx/hare-krishna.conf.example` to the host Nginx configuration.
Replace both example domain names with the real domain and keep the upstream port
in sync with `WEB_PORT`:

```bash
sudo cp deploy/nginx/hare-krishna.conf.example /etc/nginx/sites-available/hare-krishna
sudo ln -s /etc/nginx/sites-available/hare-krishna /etc/nginx/sites-enabled/hare-krishna
sudo nginx -t
sudo systemctl reload nginx
```

Request the certificate and let Certbot add the HTTPS server block:

```bash
sudo certbot --nginx -d practice.example.com
sudo certbot renew --dry-run
```

Authentication cookies are intentionally marked `Secure` in production, so
registration and login must be tested through the final HTTPS URL, not through
plain HTTP or port `8080`.

## Release updates

Back up data before each release, update the checked-out revision and rerun the
deployment script:

```bash
./deploy/backup.sh
git pull --ff-only
./deploy/deploy.sh
```

Check service state and logs with:

```bash
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs -f --tail=200 api web
curl --fail https://practice.example.com/api/health
```

## Automatic deployment from GitHub

The workflow in `.github/workflows/deploy-production.yml` verifies the frontend
and backend and then deploys every push to `main`. It can also be started
manually from the Actions page. Pushes to `dev` never deploy production.

Prepare the server checkout once:

```bash
cd /opt/hare-krishna
git switch main
git pull --ff-only origin main
git config core.fileMode false
```

The SSH user used by GitHub Actions must be able to read this checkout and run
Docker without an interactive password. Keep `.env.production` only on the
server; never add it to GitHub secrets or commit it.

Create a dedicated SSH key for GitHub Actions. Add its public key to the
deployment user's `~/.ssh/authorized_keys`, then add these secrets to the
GitHub `production` environment:

- `PROD_SSH_HOST`: server hostname or IP address;
- `PROD_SSH_USER`: Linux deployment user;
- `PROD_SSH_PRIVATE_KEY`: the complete private key, including its header and
  footer;
- `PROD_SSH_KNOWN_HOSTS`: the trusted server host-key line. Generate it from a
  trusted machine with `ssh-keyscan -H your-server.example.com` and verify its
  fingerprint before saving it.

Optional GitHub environment variables:

- `PROD_SSH_PORT`: SSH port, defaults to `22`;
- `PROD_APP_DIR`: checkout path, defaults to `/opt/hare-krishna`.

The deployment refuses to overwrite tracked changes on the server and verifies
that the checked-out revision exactly matches the revision that passed the
GitHub build. Configure a required reviewer for the `production` environment if
production updates should need manual approval after a successful build.

## Backups and restore

`deploy/backup.sh` creates two private archives in `backups/`: a PostgreSQL
custom-format dump and the audio volume. Copy these archives to storage outside the VPS. A
daily cron example:

```cron
15 2 * * * cd /opt/hare-krishna && ./deploy/backup.sh >> /var/log/hare-krishna-backup.log 2>&1
```

Restoring replaces the current database objects, so take another backup first.
Load the environment, stop public traffic and restore the database dump:

```bash
set -a
. ./.env.production
set +a
docker compose --env-file .env.production -f compose.production.yml stop web api
docker compose --env-file .env.production -f compose.production.yml exec -T postgres \
  pg_restore --clean --if-exists --no-owner --no-privileges \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backups/database-TIMESTAMP.dump
```

Restore the matching audio archive without deleting files already in the volume:

```bash
docker compose --env-file .env.production -f compose.production.yml run --rm --no-deps api \
  tar -xzf - -C /app/uploads < backups/audio-TIMESTAMP.tar.gz
```

Run `./deploy/deploy.sh` after both restores. It applies any newer migrations,
starts the services and verifies their health.

Run a restore rehearsal periodically. A backup that has never been restored is
only a hopeful archive.

## Database changes

The repository contains the initial migration under `backend/prisma/migrations`.
For every schema change, create a new migration on a development database and
commit it:

```bash
cd backend
npm run prisma:migrate -- --name short_description
```

Production only runs `prisma migrate deploy`; never use `prisma db push` there.
If an existing non-empty database was previously managed only by `db push`, it
must be baselined before adopting these migrations. Do not point this initial
migration at such a database without a backup and a baseline procedure.

## Final smoke test

After HTTPS is active, verify these flows in the browser:

1. Register a new account, log out and log in again.
2. Reload the page and confirm the session is restored.
3. Complete onboarding and save practice settings.
4. Add japa rounds, reload and confirm daily progress is preserved.
5. Upload, play and delete an audio track.
6. Restart the stack and confirm database records and audio remain available.
