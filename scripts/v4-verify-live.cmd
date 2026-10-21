@echo off
rem V4 production verify gate: simulator UX + Persian typography (both locales, 360-1733)
set CAPTURE_BASE=https://quantiviq.xyz
node scripts/sim-visual-check.mjs
