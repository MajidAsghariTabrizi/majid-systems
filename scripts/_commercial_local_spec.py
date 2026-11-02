#!/usr/bin/env python3
"""Deprecated wrapper — the commercial gate now lives in commercial_closure_spec.py
(strict exit codes: non-zero on any failure). Kept so old invocations fail loudly
instead of silently passing."""
import runpy
import sys

sys.exit(runpy.run_path('scripts/commercial_closure_spec.py', run_name='__main__').get('__exit__') or 0)
