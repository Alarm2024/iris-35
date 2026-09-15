#!/usr/bin/env python3
"""Optional local build. Does what the Pages workflow used to do, on your machine.

The repo root is already a working site — GitHub Pages can serve it straight
from the branch with no Actions minutes. Run this only when you want the two
extras CI used to add:

    python3 build.py            bake the hero, refresh icons, bump the worker
    python3 build.py --check    just verify the site is complete (no writes)

What it does:
  * lockup.py bakes lockup.jpg (IRIS / ELGHALY under the 35) and points the
    hero and the social card at it instead of 35.elghaly.dev
  * icons.py refreshes the home-screen icons
  * bumps the service worker version so returning phones pick the change up

Needs Pillow (`pip install pillow`) and a line out to 35.elghaly.dev.
Everything it writes is committed to the branch — that is the deploy.
"""
import datetime
import hashlib
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).parent

# Every file the page needs in order to work when served from the branch.
REQUIRED = [
    "index.html", "iris.css", "i18n.js", "app.js", "boot.js", "ui.js", "sw.js",
    "favicon.svg", "iris-eye.svg", "qr.svg", "manifest.webmanifest",
    "icon-192.png", "icon-512.png", "icon-maskable-512.png",
    "health.json", "robots.txt", "sitemap.xml", "CNAME", ".nojekyll",
]


def check():
    """Fail loudly if the branch is missing anything the page references."""
    missing = [f for f in REQUIRED if not (ROOT / f).is_file()]

    html = (ROOT / "index.html").read_text(encoding="utf-8")
    refs = set(re.findall(r'(?:src|href)="([\w.-]+\.(?:js|css|svg|png|webmanifest))"', html))
    unshipped = sorted(r for r in refs if not (ROOT / r).is_file())

    for label, items in (("missing required file", missing),
                         ("referenced but not in the repo", unshipped)):
        for i in items:
            print("  MISSING  %s: %s" % (label, i))

    if missing or unshipped:
        return 1
    print("  ok  %d files, every reference in index.html resolves" % len(REQUIRED))
    return 0


def bump_worker():
    sw = ROOT / "sw.js"
    stamp = datetime.date.today().isoformat()
    digest = hashlib.sha256(
        b"".join((ROOT / f).read_bytes() for f in REQUIRED if (ROOT / f).is_file())
    ).hexdigest()[:6]
    text = re.sub(r'var VERSION="[^"]*";', 'var VERSION="%s-%s";' % (stamp, digest),
                  sw.read_text(encoding="utf-8"))
    sw.write_text(text, encoding="utf-8")
    print("  service worker version -> %s-%s" % (stamp, digest))


def bake_hero():
    """lockup.py writes _site/lockup.jpg; move it to the root and re-point the page."""
    subprocess.run([sys.executable, "lockup.py"], check=True)
    built = ROOT / "_site" / "lockup.jpg"
    if not built.is_file():
        print("  lockup.py produced nothing — leaving the hero on 35.elghaly.dev")
        return
    (ROOT / "lockup.jpg").write_bytes(built.read_bytes())
    page = ROOT / "index.html"
    html = page.read_text(encoding="utf-8")
    html = html.replace('src="https://35.elghaly.dev/IMG_5183.jpeg"', 'src="lockup.jpg"')
    html = html.replace("https://35.elghaly.dev/IMG_5183.jpeg",
                        "https://iris-35.elghaly.dev/lockup.jpg")
    page.write_text(html, encoding="utf-8")
    print("  hero baked -> lockup.jpg")


if __name__ == "__main__":
    if "--check" in sys.argv:
        raise SystemExit(check())
    subprocess.run([sys.executable, "icons.py", "--root"], check=True)
    bake_hero()
    bump_worker()
    raise SystemExit(check())
