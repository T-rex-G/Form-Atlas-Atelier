#!/usr/bin/env python3
"""Serve the extracted atlas only on this computer. Ctrl-C stops it."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from functools import partial
R=Path(__file__).resolve().parent
print('Open http://127.0.0.1:8765/START_HERE.html — Ctrl-C to stop',flush=True)
try:ThreadingHTTPServer(('127.0.0.1',8765),partial(SimpleHTTPRequestHandler,directory=str(R))).serve_forever()
except KeyboardInterrupt:pass
