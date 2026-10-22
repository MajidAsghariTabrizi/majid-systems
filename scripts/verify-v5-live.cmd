@echo off
rem V5 production verify gate: lean acceptance gate against https://quantiviq.xyz
set CAPTURE_BASE=https://quantiviq.xyz
node scripts\v5-prod-gate.mjs
