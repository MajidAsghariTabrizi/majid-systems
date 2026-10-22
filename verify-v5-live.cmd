@echo off
rem V5 production verify gate: full acceptance suite against https://quantiviq.xyz
set CAPTURE_BASE=https://quantiviq.xyz
node scripts\sim-visual-check.mjs
