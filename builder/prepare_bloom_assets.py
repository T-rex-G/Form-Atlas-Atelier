#!/usr/bin/env python3
"""Fetch hash-pinned original Bloom recording inputs into an external directory."""
import hashlib
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

DEST = Path(sys.argv[1]).resolve()
DEST.mkdir(parents=True, exist_ok=True)
STAGED = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else None
VIDEO_BASE = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/'
FONT_BASE = 'https://fonts.gstatic.com/s/'
INPUTS = [
    ('v1.mp4', VIDEO_BASE+'202606101700_hglz7q.mp4', 'cb487ee62352f053c263a4e286dfc753e98ee1cb0314e5fa858ed2d3ea71d75e'),
    ('v2.mp4', VIDEO_BASE+'202606101702_sd50y0.mp4', '66acf2a4848c790797ef158c1e11848995e43a15b6de4fd7afb888e64eb05597'),
    ('v3.mp4', VIDEO_BASE+'202606101703_jmidj2.mp4', '8d014b0acc1a7d5e352e955f1ca466c609494015f1c0f83b4a71947eab56bc40'),
    ('font-0.ttf', FONT_BASE+'manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf', 'a13d9b41b0a471ce58f0e46d377fa3cc76615e4632c3b15eb397caadf7a13f0a'),
    ('font-1.ttf', FONT_BASE+'manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk7PFO_F.ttf', 'f433e5d333be1128d8ec8a28b8aadd0314d10e14e4105406076666bc830fc15d'),
    ('font-2.ttf', FONT_BASE+'manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE-_F.ttf', '6bad1a774228464cc88b8b0271555b266f7a3c64a7bedf15e165fdab4f6ac0ce'),
    ('font-3.ttf', FONT_BASE+'manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4aE-_F.ttf', 'b9584e099e0e7f1e1e914c3037aabb9010c50346a3ce8df5eeeeecc0563044d8'),
    ('font-4.ttf', FONT_BASE+'spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsj.ttf', 'ec926d5065eaca49a48f96e312bbae0bbc5733c24215cf5dfabbdccee926fef7'),
    ('font-5.ttf', FONT_BASE+'spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUUsj.ttf', '3e699ead1876244fa392243054ddefe7cf631b488438828a8a100731a22ab995'),
    ('font-6.ttf', FONT_BASE+'spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj42Vksj.ttf', '6c0346b8d297ebdc225832833e03e884a26ad99d265ecd3924d46e1ba285ea87'),
]
for name, url, expected in INPUTS:
    target = DEST/name
    if not target.exists():
        if STAGED:
            parts = sorted(STAGED.glob(name+'.part-*'))
            if not parts:
                raise ValueError('Staged original recording input missing: '+name)
            content = b''.join(part.read_bytes() for part in parts)
        else:
            with urllib.request.urlopen(url, timeout=90) as response:
                content = response.read()
        if hashlib.sha256(content).hexdigest() != expected:
            raise ValueError('Original recording input changed: '+name)
        target.write_bytes(content)
    if hashlib.sha256(target.read_bytes()).hexdigest() != expected:
        raise ValueError('Recording input checksum mismatch: '+name)
    if name.endswith('.mp4'):
        info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(target)]))
        video = next(s for s in info['streams'] if s['codec_type'] == 'video')
        assert (video['width'], video['height'], video['avg_frame_rate'], video['nb_frames']) == (1920, 1080, '24/1', '192')
    print('VERIFIED '+name, flush=True)
