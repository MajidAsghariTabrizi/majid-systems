@echo off
REM Live verification for the V3 release. Read-only against production.
REM Exit code 0 = all live checks pass.

setlocal
set BASE=https://quantiviq.xyz
set FAIL=0

echo === 1. Routes ===
curl -sk -o NUL -w "root %%{http_code} -> %%{redirect_url}\n" %BASE%/ | findstr /R "307" >NUL || set FAIL=1
curl -sk -o NUL -w "en %%{http_code}\n" %BASE%/en | findstr "200" >NUL || set FAIL=1
curl -sk -o NUL -w "fa %%{http_code}\n" %BASE%/fa | findstr "200" >NUL || set FAIL=1
curl -sk -o NUL -w "about-legacy %%{http_code} -> %%{redirect_url}\n" %BASE%/about | findstr "308" >NUL || set FAIL=1
curl -sk -o NUL -w "sitemap %%{http_code}\n" %BASE%/sitemap.xml | findstr "200" >NUL || set FAIL=1
curl -sk -o NUL -w "robots %%{http_code}\n" %BASE%/robots.txt | findstr "200" >NUL || set FAIL=1

echo === 2. Lead health (read-only, no submissions) ===
curl -sk %BASE%/api/lead | findstr /C:"\"storage\":\"writable\"" >NUL || set FAIL=1
curl -sk %BASE%/api/lead

echo === 3. FA direction ===
curl -sk %BASE%/fa | findstr /C:"dir=\"rtl\"" >NUL || set FAIL=1

echo === 4. Rendered-DOM localization (playwright) ===
pushd %~dp0
set CAPTURE_BASE=%BASE%
node scripts\sim-dom-l10n.mjs || set FAIL=1
popd

if %FAIL%==1 (
  echo LIVE VERIFY: FAIL
  exit /b 1
)
echo LIVE VERIFY: ALL PASS
exit /b 0
