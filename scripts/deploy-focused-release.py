#!/usr/bin/env python3
"""SHA-pinned Quantiviq website release; existing server configuration is retained.

  python scripts/deploy-focused-release.py --inspect
  python scripts/deploy-focused-release.py --prepare <full-git-sha>
  python scripts/deploy-focused-release.py --activate <full-git-sha>

The password is read into memory from the existing local credential file. SSH
must already be trusted in ~/.ssh/known_hosts. No credentials are printed. Only
prepare/activate mutate the server, and neither installs packages, rewrites the
unit/nginx/environment, touches lead data, or deploys the separate Mind service.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re
import shlex
import sys
import time

import paramiko


HOST = "171.22.24.45"
PASSWORD_FILE = Path.home() / ".dsh" / "var" / "quantiviq-ssh.password"

# Run through stdin rather than copying credentials or an executable to the VPS.
REMOTE = r'''
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request

APP = Path('/opt/majid-systems')
RELEASES = Path('/opt/quantiviq-releases')
SERVICE = 'majid-systems'
MODE, SHA = sys.argv[1:3]
ROUTES = ('/en', '/fa', '/fa/solutions', '/en/solutions',
          '/fa/solutions/quote-desk', '/fa/solutions/cash-recovery',
          '/fa/solutions/quote-desk/request', '/en/mind', '/meet-majid')
REQUIRED = ('BUILD_ID', 'build-manifest.json', 'routes-manifest.json',
            'prerender-manifest.json', 'required-server-files.json',
            'server/pages-manifest.json', 'server/app-paths-manifest.json')


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def run(args, cwd=APP, timeout=90, check=True):
    result = subprocess.run(args, cwd=str(cwd), stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, timeout=timeout)
    if check and result.returncode:
        # Commands never contain credentials. Keep error output bounded.
        raise RuntimeError('Command failed: ' + ' '.join(args) + '\n' +
                           result.stderr.decode('utf-8', 'replace')[-1200:])
    return result


def git(*args):
    return run(['git', *args]).stdout.decode().strip()


def digest_bytes(value):
    return hashlib.sha256(value).hexdigest()


def file_hash(path):
    if not path.is_file():
        return None
    h = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def protected_hashes():
    # Hash bytes without displaying their contents, including effective drop-ins.
    unit = run(['systemctl', 'cat', SERVICE]).stdout
    nginx = Path('/etc/nginx/sites-enabled/quantiviq')
    require(nginx.is_file(), 'Expected active Quantiviq nginx configuration missing')
    return {
        'environment': file_hash(APP / '.env.production'),
        'nginx': file_hash(nginx.resolve()),
        'effective_unit': digest_bytes(unit),
    }


def worktree_status():
    value = run(['git', 'status', '--porcelain=v1', '-z', '--untracked-files=normal']).stdout
    return [x.decode('utf-8', 'replace') for x in value.split(b'\0') if x]


def check_worktree():
    entries = worktree_status()
    for entry in entries:
        require(len(entry) > 3, 'Unexpected git status entry')
        path = entry[3:]
        allowed = (entry[:2] == ' M' and path == 'package-lock.json') or (
            entry[:2] == '??' and path == '.env.production')
        require(allowed, 'Unreviewed server worktree change: ' + entry)
    return entries


def active():
    return run(['systemctl', 'is-active', SERVICE], check=False).stdout.decode().strip()


def build_id(build):
    path = build / 'BUILD_ID'
    return path.read_text().strip() if path.is_file() else None


def baseline():
    return {
        'head': git('rev-parse', 'HEAD'),
        'branch': git('symbolic-ref', '--short', 'HEAD'),
        'worktree': check_worktree(),
        'package_lock_worktree_sha256': file_hash(APP / 'package-lock.json'),
        'protected': protected_hashes(),
        'build_id': build_id(APP / '.next'),
        'service': active(),
    }


def checked_release():
    require(re.fullmatch(r'[0-9a-f]{40}', SHA), 'Use an exact, lowercase 40-character SHA')
    require(RELEASES.is_dir() and not RELEASES.is_symlink(), 'Release root is not a real directory')
    release = RELEASES / SHA
    require(release.parent.resolve() == RELEASES.resolve(), 'Release path escaped its root')
    require(not release.is_symlink(), 'Release directory must not be a symlink')
    return release


def write_json(path, value):
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(json.dumps(value, indent=2) + '\n')
    os.replace(temp, path)


def assert_protected(expected):
    require(protected_hashes() == expected, 'Protected environment/nginx/unit hash changed')


def dependency_gate(target, previous):
    for filename in ('package.json', 'package-lock.json'):
        before = run(['git', 'show', previous + ':' + filename]).stdout
        after = run(['git', 'show', target + ':' + filename]).stdout
        require(before == after, 'This deploy does not support dependency changes: ' + filename)


def manifests(build):
    require(build.is_dir() and not build.is_symlink(), 'Build directory missing or unsafe')
    result = {}
    for name in REQUIRED:
        path = build / name
        require(path.is_file(), 'Required build file missing: ' + name)
        result[name] = file_hash(path)
    require(build_id(build), 'Empty build ID')
    require((build / 'static').is_dir(), 'Build static assets missing')
    return result


def health(timeout=60):
    deadline = time.monotonic() + timeout
    last = 'not yet checked'
    while time.monotonic() < deadline:
        try:
            results = {}
            for route in ROUTES:
                request = urllib.request.Request('http://127.0.0.1:3000' + route,
                                                  headers={'Host': 'quantiviq.xyz'})
                with urllib.request.urlopen(request, timeout=6) as response:
                    page = response.read()
                    require(response.status == 200, 'Non-200 route: ' + route)
                    require(len(page) > 500 and b'<html' in page.lower(),
                            'Invalid HTML on ' + route)
                    results[route] = response.status
            require(active() == 'active', 'Website service is not active')
            return results
        except Exception as exc:
            last = str(exc)
            time.sleep(2)
    raise RuntimeError('Website health checks failed: ' + last)


def inspect():
    # Do not create directories, locks or files in inspection mode.
    info = baseline()
    info['disk_free_bytes'] = shutil.disk_usage(APP).free
    info['node'] = run(['node', '--version']).stdout.decode().strip()
    info['release_root_exists'] = RELEASES.is_dir()
    info['phase'] = 'inspect'
    print(json.dumps(info, indent=2), flush=True)


def prepare():
    old = baseline()
    require(old['branch'] == 'main', 'Expected production branch main')
    require(old['service'] == 'active' and old['build_id'], 'Live site is not healthy before prepare')
    require(old['protected']['environment'], 'Existing .env.production is required')
    # Prevent Next from attempting an automatic dependency installation against
    # the shared live node_modules directory during its TypeScript preflight.
    for dependency in ('typescript/lib/typescript.js', '@types/react/index.d.ts',
                       '@types/node/index.d.ts'):
        require((APP / 'node_modules' / dependency).is_file(),
                'Staging requires preinstalled build dependency: ' + dependency)
    require(shutil.disk_usage(APP).free > 1024 * 1024 * 1024, 'Less than 1 GiB free')
    run(['git', 'fetch', 'origin', 'main'], timeout=120)
    require(git('rev-parse', SHA + '^{commit}') == SHA, 'SHA is not a commit')
    run(['git', 'merge-base', '--is-ancestor', old['head'], SHA])
    run(['git', 'merge-base', '--is-ancestor', SHA, 'origin/main'])
    dependency_gate(SHA, old['head'])
    require(git('rev-parse', 'HEAD') == old['head'], 'Live HEAD changed during prepare')
    release = checked_release()
    release.mkdir(mode=0o700, exist_ok=True)
    source = release / 'source'
    require(not source.is_symlink(), 'Unsafe staging source symlink')
    previous = release / 'prepared.json'
    if previous.is_file():
        info = json.loads(previous.read_text())
        require(info['sha'] == SHA and info['baseline'] == old,
                'Prepared release baseline has changed; inspect before retrying')
        require(manifests(source / '.next') == info['manifests'], 'Prepared build changed')
        print(json.dumps({'phase': 'prepared', 'sha': SHA, 'reused': True,
                          'build_id': info['build_id']}), flush=True)
        return
    start = release / 'prepare-start.json'
    if start.exists():
        info = json.loads(start.read_text())
        require(info['sha'] == SHA and info['baseline'] == old,
                'Previous incomplete prepare belongs to a different baseline')
        require(source.is_dir(), 'Incomplete staging source; inspect manually')
    else:
        require(not source.exists(), 'Unexpected pre-existing staging source')
        source.mkdir(mode=0o700)
        archive = release / 'source.tar'
        with archive.open('wb') as output:
            proc = subprocess.run(['git', 'archive', SHA], cwd=str(APP), stdout=output,
                                  stderr=subprocess.PIPE, timeout=90)
        require(proc.returncode == 0, 'git archive failed')
        run(['tar', '-xf', str(archive), '-C', str(source)])
        write_json(start, {'sha': SHA, 'baseline': old, 'started_at': time.time()})
    for name, target in [('node_modules', APP / 'node_modules'),
                         ('.env.production', APP / '.env.production')]:
        require(target.exists(), 'Live dependency/environment path missing: ' + name)
        link = source / name
        if link.is_symlink():
            require(link.resolve() == target.resolve(), 'Unexpected staging link: ' + name)
        else:
            require(not link.exists(), 'Archive contains unsafe staging path: ' + name)
            link.symlink_to(target, target_is_directory=target.is_dir())
    # Limit the memory-heavy page-data phase to one worker, only in staging.
    config = source / 'next.config.mjs'
    original = run(['git', 'show', SHA + ':next.config.mjs']).stdout.decode()
    marker = 'export default nextConfig;'
    require(original.count(marker) == 1, 'Unsupported Next config export')
    config.write_text(original.replace(marker,
        "nextConfig.experimental = { ...nextConfig.experimental, cpus: 1, workerThreads: false };\n" + marker))
    env = dict(os.environ)
    env['NODE_ENV'] = 'production'
    env['NODE_OPTIONS'] = '--max-old-space-size=512'
    env['NEXT_TELEMETRY_DISABLED'] = '1'
    print(json.dumps({'phase': 'building', 'sha': SHA,
                      'log': str(release / 'build.log')}), flush=True)
    with (release / 'build.log').open('wb') as output:
        process = subprocess.Popen(['node', str(APP / 'node_modules/next/dist/bin/next'), 'build'],
                                   cwd=str(source), env=env, stdout=output,
                                   stderr=subprocess.STDOUT, start_new_session=True)
        try:
            code = process.wait(timeout=1200)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            raise RuntimeError('Staged build timed out; live build was not touched')
    require(code == 0,
            'Staged build failed with exit ' + str(code) + '; inspect release build.log')
    require(git('rev-parse', 'HEAD') == old['head'], 'Live HEAD changed during build')
    require(file_hash(APP / 'package-lock.json') == old['package_lock_worktree_sha256'],
            'Live package-lock changed during build')
    assert_protected(old['protected'])
    info = {'sha': SHA, 'baseline': old, 'build_id': build_id(source / '.next'),
            'manifests': manifests(source / '.next'), 'prepared_at': time.time()}
    write_json(previous, info)
    print(json.dumps({'phase': 'prepared', 'sha': SHA, 'build_id': info['build_id']}), flush=True)


def preserve_static(old_build, new_build):
    # Keep already-open clients' immutable chunks available after the release.
    old_static, new_static = old_build / 'static', new_build / 'static'
    require(old_static.is_dir(), 'Old static directory missing')
    copied = 0
    for item in old_static.rglob('*'):
        require(not item.is_symlink(), 'Unexpected old static symlink')
        if item.is_file():
            destination = new_static / item.relative_to(old_static)
            if destination.exists():
                require(file_hash(item) == file_hash(destination),
                        'Static asset collision: ' + str(item.relative_to(old_static)))
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(item, destination)
                copied += 1
    return copied


def activate():
    release = checked_release()
    prepared = release / 'prepared.json'
    require(prepared.is_file(), 'Run --prepare successfully before activation')
    info = json.loads(prepared.read_text())
    require(info['sha'] == SHA, 'Prepared SHA mismatch')
    if (release / 'activation.json').exists():
        done = json.loads((release / 'activation.json').read_text())
        require(done.get('status') == 'active' and git('rev-parse', 'HEAD') == SHA and
                build_id(APP / '.next') == info['build_id'], 'Release already attempted; inspect evidence')
        assert_protected(info['baseline']['protected'])
        print(json.dumps({'phase': 'active', 'sha': SHA, 'reused': True, 'routes': health()}), flush=True)
        return
    current = baseline()
    require(current == info['baseline'], 'Production baseline changed since prepare; activation aborted')
    require(current['branch'] == 'main' and current['service'] == 'active', 'Unexpected live state')
    dependency_gate(SHA, current['head'])
    new_build = release / 'source' / '.next'
    require(manifests(new_build) == info['manifests'], 'Prepared build manifest hashes changed')
    require(new_build.stat().st_dev == APP.stat().st_dev, 'Build swap requires same filesystem')
    backup = release / ('previous-' + current['head'][:12] + '-' + current['build_id'])
    require(backup.parent.resolve() == release.resolve() and not backup.exists(), 'Backup already exists or unsafe')
    backup.mkdir(mode=0o700)
    shutil.copy2(APP / 'package-lock.json', backup / 'package-lock.json')
    write_json(backup / 'baseline.json', current)
    copied = preserve_static(APP / '.next', new_build)
    evidence = {'sha': SHA, 'previous': current['head'], 'old_build_id': current['build_id'],
                'build_id': info['build_id'], 'preserved_static_files': copied,
                'backup': str(backup), 'started_at': time.time(), 'status': 'activating'}
    write_json(release / 'activation.json', evidence)
    stopped = False
    old_moved = False
    new_moved = False
    try:
        run(['systemctl', 'stop', SERVICE])
        stopped = True
        require(git('rev-parse', 'HEAD') == current['head'], 'Concurrent production checkout change')
        run(['git', 'merge', '--ff-only', SHA])
        require(git('rev-parse', 'HEAD') == SHA, 'Production did not reach requested SHA')
        (APP / '.next').rename(backup / '.next')
        old_moved = True
        new_build.rename(APP / '.next')
        new_moved = True
        run(['systemctl', 'start', SERVICE])
        stopped = False
        evidence['routes'] = health()
        assert_protected(current['protected'])
        require(file_hash(APP / 'package-lock.json') == current['package_lock_worktree_sha256'],
                'Existing package-lock modification was not preserved')
        require(worktree_status() == current['worktree'], 'Server worktree status changed unexpectedly')
        evidence.update(status='active', completed_at=time.time(),
                        protected_hashes_after=protected_hashes())
        write_json(release / 'activation.json', evidence)
        print(json.dumps({'phase': 'active', **evidence}), flush=True)
    except BaseException as exc:
        evidence['error'] = str(exc)
        try:
            run(['systemctl', 'stop', SERVICE])
            stopped = True
            if new_moved:
                # Keep the failed release for diagnosis rather than deleting it.
                (APP / '.next').rename(release / 'failed-next')
            if old_moved:
                (backup / '.next').rename(APP / '.next')
            head = git('rev-parse', 'HEAD')
            require(head in (SHA, current['head']), 'Concurrent HEAD change; refusing rollback checkout')
            if head == SHA:
                # Two-tree update preserves worktree edits to files unchanged by
                # the release (notably the server's existing package-lock edit).
                run(['git', 'read-tree', '-m', '-u', SHA, current['head']])
                run(['git', 'update-ref', 'refs/heads/main', current['head'], SHA])
            shutil.copy2(backup / 'package-lock.json', APP / 'package-lock.json')
            run(['systemctl', 'start', SERVICE])
            stopped = False
            evidence['rollback_routes'] = health()
            assert_protected(current['protected'])
            require(git('rev-parse', 'HEAD') == current['head'], 'Rollback HEAD mismatch')
            require(build_id(APP / '.next') == current['build_id'], 'Rollback build mismatch')
            require(file_hash(APP / 'package-lock.json') == current['package_lock_worktree_sha256'],
                    'Rollback did not preserve original package-lock edit')
            require(worktree_status() == current['worktree'], 'Rollback worktree differs from baseline')
            evidence['status'] = 'rolled_back'
        except BaseException as recovery:
            evidence['status'] = 'rollback_failed'
            evidence['rollback_error'] = str(recovery)
        finally:
            evidence['completed_at'] = time.time()
            write_json(release / 'activation.json', evidence)
            print(json.dumps({'phase': 'activation_failed', **evidence}), flush=True)
        raise RuntimeError('Activation failed; see saved activation.json (' + evidence['status'] + ')') from exc


require(APP.is_dir() and not APP.is_symlink(), 'Unexpected production application directory')
# A local terminal disconnect must not interrupt the short activation swap.
# Prepare never stops the live service; its process group has its own timeout.
signal.signal(signal.SIGHUP, signal.SIG_IGN)
if MODE == 'inspect':
    inspect()
else:
    require(MODE in ('prepare', 'activate'), 'Unknown mode')
    if not RELEASES.exists():
        require(MODE == 'prepare', 'Release directory missing')
        RELEASES.mkdir(mode=0o700)
    require(RELEASES.is_dir() and not RELEASES.is_symlink(), 'Unsafe release root')
    with (RELEASES / '.deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if MODE == 'prepare':
            prepare()
        else:
            activate()
'''


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    phases = parser.add_mutually_exclusive_group(required=True)
    phases.add_argument("--inspect", action="store_true", help="Read-only production metadata and protected hashes")
    phases.add_argument("--prepare", metavar="SHA", help="Archive and build exact 40-character SHA separately from live build")
    phases.add_argument("--activate", metavar="SHA", help="Activate a successfully prepared release, with automatic rollback")
    args = parser.parse_args()
    mode = "inspect" if args.inspect else "prepare" if args.prepare else "activate"
    sha = args.prepare or args.activate or "-"
    if mode != "inspect" and not re.fullmatch(r"[0-9a-f]{40}", sha):
        parser.error("Use the exact lowercase 40-character commit SHA")
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.load_host_keys(str(Path.home() / ".ssh" / "known_hosts"))
    client.set_missing_host_key_policy(paramiko.RejectPolicy())
    password = PASSWORD_FILE.read_text(encoding="utf-8").strip()
    try:
        client.connect(HOST, port=22, username="root", password=password,
                       timeout=20, banner_timeout=20, auth_timeout=20,
                       look_for_keys=False, allow_agent=False)
        password = None
        transport = client.get_transport()
        if transport is not None:
            transport.set_keepalive(20)
        command = "python3 - " + shlex.quote(mode) + " " + shlex.quote(sha)
        stdin, stdout, stderr = client.exec_command(command, timeout=1500)
        stdin.write(REMOTE)
        stdin.flush()
        stdin.channel.shutdown_write()
        channel = stdout.channel
        # Drain both streams while the build runs; never block waiting for one
        # stream while the other fills its SSH window.
        while True:
            if channel.recv_ready():
                sys.stdout.write(channel.recv(65536).decode("utf-8", "replace"))
                sys.stdout.flush()
            if channel.recv_stderr_ready():
                sys.stderr.write(channel.recv_stderr(65536).decode("utf-8", "replace"))
                sys.stderr.flush()
            if channel.exit_status_ready() and not channel.recv_ready() and not channel.recv_stderr_ready():
                break
            time.sleep(0.1)
        return channel.recv_exit_status()
    finally:
        password = None
        client.close()


if __name__ == "__main__":
    raise SystemExit(main())
