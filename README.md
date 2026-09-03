# majid-systems

> Personal engineering portfolio of **Majid Asghari**.
> Production systems, decision infrastructure, and AI engineering — served at <https://quantiviq.xyz>.

This is the source repository for the public portfolio site. It is intentionally small,
content-driven, and designed to deploy as a static asset bundle behind nginx.

---

## What's in here

```text
src/
├── app/                       Next.js App Router pages
│   ├── page.tsx                Home (hero, selected work, principles, capabilities, notes)
│   ├── work/                   Project index + case studies (Phoenix, Smart Trader, Free Router, UEA)
│   ├── notes/                  Field notes index + detail pages
│   ├── engineering/            Capabilities + principles
│   ├── open-source/            Original repos + curated/forks
│   ├── about/                  Long-form profile
│   ├── contact/                Public channels
│   ├── layout.tsx              Root layout (Header + Footer + metadata + JSON-LD)
│   ├── sitemap.ts              Auto-generated sitemap.xml
│   ├── manifest.ts             Web app manifest
│   ├── not-found.tsx           404 page
│   └── globals.css             Design system (tokens + components)
├── components/                Header, Footer, JSON-LD helpers
└── content/                    Typed content layer (single source of truth)
    ├── shared.ts               SITE, NAV constants
    ├── projects.ts             Four flagship case studies (typed)
    ├── notes.ts                Field notes collection
    ├── capabilities.ts         Product / AI / Systems / Engineering
    ├── principles.ts           Ten working principles
    ├── openSource.ts           Maintained + curated/fork lists
    └── github.ts               Build-time GitHub data with cache fallback

public/
├── favicon.svg                 Brand mark
├── og-image.svg                Open Graph card (1200×630)
└── robots.txt                  Search directives

test/                           node --test suite for content integrity
```

---

## Stack

- **Next.js 14** App Router with TypeScript
- **React 18**
- **Node.js ≥ 18.17** recommended (Next 14 requires 18.17+)
- **ESLint** via `next lint`
- **`tsc --noEmit`** for type checks
- **`node --test`** for content tests (zero deps)
- **No CSS framework** — single hand-written design system in `globals.css`
- **No runtime dependencies** in the content layer; no CMS

The site renders as static HTML + a tiny interactive shell. Most pages are static
(Server Components with no dynamic data). The header uses a single client component
for active-route highlighting.

---

## Content model

Content lives in `src/content/*.ts` as typed TypeScript modules. There is no database
and no markdown runtime. Every project, note, capability, and principle is a typed
record with required fields — so a missing field is a compile error, not a runtime bug.

**Adding a project:**

1. Add a `Project` entry to `src/content/projects.ts` (use the existing flagships as a template).
2. Add it to the flagship list (`category: 'flagship'`) if you want a case-study page.
3. The route `/work/<slug>` is generated automatically via `generateStaticParams`.

**Adding a note:**

1. Add a `Note` entry to `src/content/notes.ts`.
2. The route `/notes/<slug>` is generated automatically.

**Updating GitHub data:**

`src/content/github.ts` fetches at build time and caches to
`.cached-github.json` (git-ignored). On a build with no GitHub connectivity, the
fallback data is used so the site never depends on the live API.

---

## Local development

```bash
npm install
npm run dev              # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
npm start                # production server on :3000
```

The first build needs network access to fetch GitHub data, OR you can pre-populate
`.cached-github.json` with the schema documented in `src/content/github.ts`.

---

## Environment

Copy `.env.example` to `.env.local` for local development. **Never commit `.env.local`.**

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | no | Canonical site URL (default: `https://quantiviq.xyz`) |
| `NEXT_PUBLIC_GITHUB_USER` | no | GitHub username (default: `MajidAsghariTabrizi`) |
| `GITHUB_TOKEN` | optional | Personal access token. Increases GitHub API rate limit from 60 to 5000/hr. Only set this in the **server runtime** that produces the cache; never expose it to the browser. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | Plausible analytics domain (privacy-first analytics; leave empty to disable). |

> No analytics is loaded by default. Plausible is wired in `src/app/layout.tsx`
> if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. It is privacy-respecting and
> cookie-less.

---

## Deployment

This site is designed to be served as a static asset bundle behind nginx.

```text
Client (browser)
       │  HTTPS
       ▼
nginx (reverse proxy)  ─── /            → static export or Next.js server
                       ─── /_next/*     → static assets (long cache)
                       ─── /api/*       → upstream services (none here)
                       ─── /.well-known → ACME challenges for certbot
```

The current production deployment runs `next start` as a systemd service behind
nginx with Let's Encrypt TLS at `quantiviq.xyz`. The deployment script lives at
`scripts/deploy-prod.sh` on the server.

### Server provisioning (one-time)

```bash
# On a fresh Ubuntu 24.04 host:
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx

# Install Node.js (NodeSource, current LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Application directory
sudo mkdir -p /opt/majid-systems
sudo chown deploy:deploy /opt/majid-systems
```

### First-time deploy

```bash
# On the server, as the deploy user:
cd /opt/majid-systems
git clone https://github.com/MajidAsghariTabrizi/majid-systems.git .
npm ci --omit=dev
npm run build
```

### systemd unit

A minimal unit file:

```ini
# /etc/systemd/system/majid-systems.service
[Unit]
Description=Majid Systems Portfolio (Next.js)
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/majid-systems
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NEXT_PUBLIC_SITE_URL=https://quantiviq.xyz
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000
Restart=on-failure
RestartSec=5s
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/opt/majid-systems/.next /opt/majid-systems/.cached-github.json

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now majid-systems.service
```

### nginx site

```nginx
# /etc/nginx/sites-enabled/quantiviq
server {
    listen 80;
    server_name quantiviq.xyz www.quantiviq.xyz;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name quantiviq.xyz www.quantiviq.xyz;

    ssl_certificate     /etc/letsencrypt/live/quantiviq.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quantiviq.xyz/privkey.pem;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d quantiviq.xyz -d www.quantiviq.xyz
```

---

## Security

This repository intentionally **does not contain**:

- Private keys, signer files, or wallet secrets
- Authenticated RPC URLs or API keys
- Production environment files (`.env`, `.env.production`, `.env.local`)
- VPS addresses or SSH material
- Database credentials
- Unredacted release or incident artifacts

The `.gitignore` excludes `.env`, `.env.local`, and the local build cache. The
`.env.example` template contains **only placeholders**.

In production, the **server** holds:

- The GitHub PAT used at build time for the GitHub cache (if any).
- The Next.js production environment variables.
- The TLS private key managed by certbot.

No application-level secrets live in this repository or in the deployed bundle.

---

## Repository relationship

This site is a **portfolio**, not a product. It does not import or modify the
codebases of Phoenix, Smart Trader, Free Best Router, or Universal Engineering
Agent. Each of those projects is its own repository with its own release
process. The portfolio links to them and explains them; it never becomes them.

---

## License

MIT. See `LICENSE`.

The portfolio itself is open-source so others can build their own; the case-study
text is honest about what the projects actually are and what they actually do.