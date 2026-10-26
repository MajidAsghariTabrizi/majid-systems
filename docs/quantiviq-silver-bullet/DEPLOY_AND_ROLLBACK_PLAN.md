# DEPLOY_AND_ROLLBACK_PLAN

_Executed 2026-10-26 10:18–10:35 UTC by the owner-authorized autonomous release mission._

## What was deployed

| Component | From | To | Mechanism |
|---|---|---|---|
| Site (Next.js 14.2.18) | bc48518 | **dfd1835** | `scripts/public_deploy.py` (existing authorized workflow; git reset --hard origin/main, npm ci, build, systemd restart, nginx reload) |
| Public Mind service | 639-record DB, no scopes | **scope-aware mind_service.py + 715-record DB (knowledge_version v1-dfd1835-…)** | `scripts/release-mind-deploy.py` (new, modeled on the owner's mind-activate.py) |
| Chat config | enabled, glm-4.5-flash | **unchanged, verified byte-identical** | explicitly read-before/write-never |

## Backup (taken BEFORE deploy, on the VPS)

`/root/backups/pre-silver-bullet-20261026-101807/` containing:
site-git-sha.txt (bc48518) · site-source.tar.gz (230 MB) · site-next-build.tar.gz (18 MB) ·
public-knowledge.sqlite (639-record) · mind_service.py (old) · /etc/public-mind/{config.json,env} ·
nginx-quantiviq.conf · majid-systems.service · public-mind.service · MANIFEST.txt

Plus automatic: /opt/public-mind/public-knowledge.sqlite.bak-<ts> beside the live DB.

## Rollback procedures (tested paths)

**Site** (≈4 min):
```bash
# on the VPS
cd /opt/majid-systems && git reset --hard bc48518
rm -rf .next && npm ci --omit=dev && npm run build
systemctl restart majid-systems
curl -sk -H 'Host: quantiviq.xyz' https://127.0.0.1/en | head -c 200
```
(or restore the tarred source/build: `tar xzf /root/backups/pre-silver-bullet-*/site-source.tar.gz`)

**Mind** (≈1 min):
```bash
cp /opt/public-mind/public-knowledge.sqlite.bak-<ts> /opt/public-mind/public-knowledge.sqlite
# old service code is in the backup dir if needed:
# cp /root/backups/pre-silver-bullet-*/mind_service.py /opt/public-mind/mind_service.py
systemctl restart public-mind && curl -s http://127.0.0.1:8210/health
```
The old service code remains 100% compatible with the old DB (the new service is a superset: scope absent = all).

**Trigger criteria for rollback** (from the mission): critical production regression — route 5xx, chat hard-down, data exposure. None occurred; the deploy passed all gates first-try except the mind DB restamp (metadata only), which was redeployed cleanly.

## Post-deploy verification actually run

`scripts/sb-prod-verify.mjs` → 25/25 routes 200 · 0 console errors · covers 7/7 (+3 fallbacks) ·
10 book cards · 12 flows EN/FA · 5 stack nodes · hero CTA → /explore · sitemap 9/9 new groups ·
mind gateway scope=books returns only book citations + complete real answer · default question
complete with 1915 tokens · legacy /journey, /notes/*, /lab, smart-trader all 200.
