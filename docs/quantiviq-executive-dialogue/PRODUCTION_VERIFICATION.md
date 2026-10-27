# PRODUCTION_VERIFICATION

**Live URL:** https://quantiviq.xyz/meet-majid
**Deployed:** 2026-10-26 · site `ad50abd` (merge of silver-bullet `5604f24`) · mind service upgraded in place (config byte-identical, DB unchanged 715 records)

## Verified in production (scripts/exec-prod-verify.mjs, captures-exec/prod/)

| Check | Result |
|---|---|
| Route | 200 direct (refresh/deep-link safe — App Router page, no client-only routing) |
| Headers | X-Robots-Tag: noindex, nofollow, noarchive · Cache-Control: no-store |
| Metadata | robots noindex/nofollow + googleBot noarchive |
| Isolation | no public nav/footer rendered; absent from sitemap.xml; no inbound links (test-enforced); robots.txt deliberately NOT used (would advertise the path) |
| First screen | MAJID ASGHARI TABRIZI / Product Leadership × Systems Thinking × Applied AI / "Don't just read my résumé. Challenge how I think." / AI-representation disclosure / unlisted-not-private note |
| Three entry paths | Explore My Work · Challenge My Thinking · Discuss AI Transformation (each with 3 starter questions, EN+FA) |
| Turn 1 (shipped vs experimental) | done=ok, 1447 chars, 7 cited sources |
| Turn 2 (context retention: "the retired one…") | done=ok, 1443 chars — correctly continued the Phoenix retirement thread |
| Turn 3 (challenge own answer) | done=ok — exposed weakest claims |
| Persian turn | done=ok, 1098 chars fluent Persian, 7 sources |
| Project naming probe | all four documented items named with inline allowlisted citations |
| Citation hygiene | 0 non-allowlisted URLs in any production answer; all source URLs on quantiviq.xyz / github.com/MajidAsghariTabrizi |
| /en/mind regression | 200, cited answer, 5 sources (default persona unchanged) |
| Service config | chat_enabled=true, glm-4.5-flash, budgets $0.50/$10 — byte-identical before/after deploy |
| Budget after deploy gates | day $0.0068 / $0.50 · month $0.0283 / $10.00 |

## Rollback

- Site: git revert on main → public_deploy.py (previous release `6d4afef` verified buildable).
- Service: /root/backups/mind_service.pre-exec-*.py on the VPS (cp back + systemctl restart public-mind; config/DB untouched by this deploy).
- Executive UI alone: remove the (exec) route group — zero coupling to public shells.

## Known limitations (honest)

1. Unlisted ≠ private: anyone with the link can converse; no confidential material is present or retrievable (the corpus contains only already-published site content + public repos).
2. glm-4.5-flash is the only model runnable on the authorized account (others HTTP 429 "no resource package"); benchmark of alternatives blocked by account, not by choice.
3. Time-to-first-chunk 10-13 s on long executive answers (model + thinking-disabled streaming); disclosed in the UI via streaming caret.
4. No vision-capable reviewer existed in this environment; UI verification is programmatic (DOM/axe/interaction) with screenshots committed for human review.
5. Privacy-refusal checking started with a narrow regex; 2/120 refusal answers passed by human verification rather than pattern match (checker widened for future runs).
