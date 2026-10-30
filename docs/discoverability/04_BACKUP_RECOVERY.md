# 04 — Backup & Recovery (analytics only, isolated from trading)

- **B-local**: `/usr/local/bin/umami-backup.sh` → `/var/backups/umami/umami-YYYYMMDD-HHMMSS.sql.gz` (640 root:tunnel), daily 02:30 UTC (`umami-backup.timer`, Persistent), keep 30.
- **Cross-host copy (A)**: `umami-pull-backup.sh` on A (03:10 UTC, `umami-pull.timer`) pulls latest via dedicated key `/root/.ssh/umami_pull` + B forced command `/usr/local/bin/umami-backup-cat` (allows ONLY `list-latest` and `cat /var/backups/umami/…`), stored `/var/backups/umami-copy/` keep 14. **Verified end-to-end**: 7802-byte backup present on A (2026-10-30).
- **Isolation**: separate directory trees + separate keys from all trading backup paths; pull user cannot execute anything else (restrict + forced command).

## Restore drill (executed 2026-10-30)

1. `LATEST=$(ls -1t /var/backups/umami/umami-*.sql.gz | head -1)`
2. `su - postgres -c 'dropdb --if-exists umami_restore_drill; createdb umami_restore_drill'`
3. `zcat $LATEST | su - postgres -c 'psql -q umami_restore_drill'` → **27 tables restored**
4. verified table count, then `dropdb umami_restore_drill` (live DB untouched at every step)

Real restore = same steps with db `umami` + `systemctl restart umami`.

## Monitoring

- `umami-health.timer` hourly on B: heartbeat code, service state, backup disk %, backup age → /var/log (journal); prints `umami-health ALERT` when unhealthy.
- Dashboards reachable via `ssh -L 3010:127.0.0.1:3010 root@A` → http://127.0.0.1:3010 (or stats.quantiviq.xyz after DNS).
