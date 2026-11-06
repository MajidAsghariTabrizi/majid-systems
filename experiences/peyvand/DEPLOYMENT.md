# PEYVAND: independent experience at an unlisted path

Final target, following the owner's direction correction:

`https://quantiviq.xyz/peyvand/`

The exact `/peyvand` path redirects308 to its trailing-slash canonical path.
No subdomain, DNS change or new TLS certificate is needed. The earlier prepared
subdomain templates remain unused references and must not be activated.

## Isolation

The source is a separate Next.js static-export project under
`experiences/peyvand`, with `basePath: '/peyvand'`, independent CSS and locally
hosted licensed Persian font. It is not an application route in the main
Quantiviq Next.js tree. No main layout, navigation, sitemap or stylesheet imports
the experience. Its browser actions remain local; no forms, analytics, external
contacts or external content dependencies are introduced.

The page is unlisted/noindex, **not access-controlled**: anyone with the URL can
open it. Do not describe it as authenticated or confidential hosting.

## Existing infrastructure and the additive route

Read-only inspection on2026-11-06 verified server171.22.24.45, healthy main
service, commitc2448372b017306cd4a18a8716bfe4cc36c422e5 and existing valid apex
certificate. The existing HTTPS server is in
`/etc/nginx/sites-available/quantiviq`.

Path deployment adds exactly one marked include in that HTTPS server:

```nginx
    # PEYVAND independent static experience
    include /etc/nginx/snippets/peyvand-location.conf;
```

The helper finds the unique exact apex `server_name` anchor, verifies it belongs
to the HTTPS block and rejects unknown pre-existing PEYVAND configuration.
Existing locations, certificates, server blocks and service definitions remain
unchanged. The expected main Nginx hash changes only by this additive include;
all other protected hashes must remain identical. Earlier DNS/certificate
investigation is historical context and does not block the final path.

## Build, stage and activate

Build the isolated project using its own scripts/configuration. Confirm the
export contains Persian RTL `index.html` and `404.html`, noindex/nofollow
metadata and asset URLs prefixed with `/peyvand/`.

Run from the repository root:

```powershell
python -B -X utf8 experiences/peyvand/deploy/deploy_static.py --inspect
python -B -X utf8 experiences/peyvand/deploy/deploy_static.py --stage D:/absolute/path/to/experiences/peyvand/out --release <hex-release-id>
python -B -X utf8 experiences/peyvand/deploy/deploy_static.py --activate-path <hex-release-id>
python -B -X utf8 experiences/peyvand/deploy/deploy_static.py --verify-path
```

A release identifier is12–64 lowercase hex characters, normally a content hash
or source commit. Staged releases are immutable; use a new identifier when
content changes. The helper reads the existing SSH password into memory and
validates the known host key. It never prints credentials or passes them in shell
arguments. Only static export files are uploaded. File hashes are verified;
symlinks, environment files and unsafe archive paths are rejected. No dependency
installation or server-side Node process is needed.

## Server boundary and response policies

```text
/var/www/peyvand/releases/<release-id>/      immutable static export
/var/www/peyvand/current                    atomic content symlink
/var/www/peyvand/activation.json            receipt outside served root
/etc/nginx/snippets/peyvand-location.conf   dedicated /peyvand locations
/etc/nginx/snippets/peyvand-headers.conf    proposal-only response headers
```

The exact prefix routes to the independent static root. Existing localized
pages, APIs, analytics and SmartTrader locations retain their routing. Persian
404 handling preserves an actual404 status. Directory listing is disabled and
the deployment manifest URL is denied.

Proposal responses include `X-Robots-Tag: noindex, nofollow, noarchive,
nosnippet`, no-store, framing protection, no-referrer and same-origin CSP.
Inline script/style allowances support generated React hydration/CSS;
third-party origins remain disallowed. No authentication or new credentials are
created. Existing apex TLS is used with normal certificate validation.

## Verification and rollback

Activation checks `nginx -t` before reloading. It verifies main commit, build,
environment, effective unit and unrelated enabled Nginx configurations. Only the
reviewed additive include hash is allowed to change. Main `/en`, `/fa` and
`/en/mind` health is checked.

Path health uses HTTPS with normal hostname verification and an explicit local
address mapping. It checks HTML/noindex, generated CSS, JavaScript and font,
canonical308 redirect and an unknown path's Persian404. The actual public URL
must also be verified normally; staging alone is not deployment success.

If syntax, protected hashes or health fail, activation restores previous main
config bytes, proposal snippets and content symlink, validates and reloads the
restored configuration. Old releases remain for diagnosis.

To roll content back later, activate the previous staged release identifier with
`--activate-path`. To remove the experience, restore the pre-PEYVAND main config
or remove only the marked include, run `nginx -t`, then reload Nginx. Do not
alter shared TLS certificates or other sites. No DNS change needs reversal.
