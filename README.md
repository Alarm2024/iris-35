# 35 IRIS

Standalone from the 35 closed desk.

Live: https://iris-35.elghaly.dev

Repo 35 custom domain stays 35.elghaly.dev. Do not change it.

## What the page is

One static page. Everything runs on the visitor's own glass:

- **The desk** — an iPhone and an Android checklist. Tap what you see, the page
  classes the phone A / B / C and tells you what to remove yourself.
- **The chain read** — paste a *public* Solana signature, Bitcoin txid or
  Ethereum hash (or a whole explorer link) and it names what was actually
  signed: unlimited approvals, `setApprovalForAll`, `permit`, `SetAuthority`.
  A seed phrase is detected and refused before any network call is made.
- **Ask IRIS** — offline pattern match on what the caller said.

No answer, mail address or hash is ever sent to a server of ours. The only
outbound calls are to the public chain RPCs listed in the page's CSP.

## Files

| File | Role |
| --- | --- |
| `index.html` | markup only — no inline script, so the page runs under a strict CSP |
| `i18n.js` | every string in 6 languages (en, ar, ru, zh, de, es) + `applyI18n()` |
| `sol-decode.js` | pure Solana decoder (`decodeSolanaTx`) — no DOM, no network |
| `app.js` | the desk tracks, the classifier, the chain read, report export |
| `boot.js` | the static cards (official door, tap vs write, two doors, …) |
| `ui.js` | language switch, ask box, live status, offline banner, install prompt |
| `sw.js` | service worker — the desk opens on a dead line |
| `iris.css` | accessibility, print and progress styles on top of the inline sheet |
| `iris-eye.svg` | the eye mark, shown low on the page above the footer |
| `qr.svg` | QR for the official URL — dark on white, never tint or invert it |
| `lockup.py` | bakes `lockup.jpg` (the hero) — optional, via `build.py` |
| `icons.py` | draws the PWA / iOS icons (`--root` writes them next to the page) |
| `build.py` | optional local build + `--check` that the branch is complete |
| `gate.js`, `addr.js`, `lock.js`, `make_logo.py` | **not deployed** — kept for reference only. The deskSigner / Squads addresses `addr.js` held now live in the footer markup |

Footer order (deskSigner, Squads, Cairo, San Francisco) is set in the markup.
`boot.js` used to reorder it by index, which only held while the two street
addresses were the only `.addr` nodes.

The 35 photo is the logo. It stays the hero at the top of the page and the
social-card image; `iris-eye.svg` sits further down, above the footer.

## Deploying — no Actions needed

The repo root **is** the site. GitHub Pages serves it straight from the branch,
which uses no Actions minutes at all:

> Settings → Pages → Build and deployment → Source: **Deploy from a branch**
> → Branch: **main** / **/ (root)** → Save

Every file the page needs is committed: the scripts, the icons, `qr.svg`,
the manifest and `.nojekyll` (which stops Jekyll touching the files). Pushing to
`main` is the deploy.

Before you push, this tells you if anything is missing:

```sh
python3 build.py --check
```

### A note on plans

Pages does not serve a **private** repo on a free plan, and Actions minutes are
only metered on private repos — they are free and unlimited on public ones.
If this repo is private and the plan lapsed, making it **public** restores both
at no cost, and is the shortest way back to a green deploy.

### The optional extras

`python3 build.py` does locally what CI used to do, and is only worth running
when you want either of these:

- `lockup.py` bakes `lockup.jpg` — IRIS / ELGHALY set under the 35 — and points
  the hero and the social card at it. Without it the hero loads the same 35
  photo straight from `35.elghaly.dev`, which is what the committed page does.
- the service-worker version is bumped, so phones that already have the page
  installed pick up the change.

`.github/workflows/pages.yml` still holds the old CI build for the day minutes
are available again. It no longer runs on push — on a private repo every push
was just burning a failed run.

## Build (CI, currently off)

`.github/workflows/pages.yml` runs on every push to `main`:

1. `node --check` every script and parse the manifest.
2. Copy the deployed files into `_site/`.
3. `lockup.py` bakes the hero image, `icons.py` draws the icons.
4. Every local `.js` / `.css` / the hero gets a `?v=<content hash>` — a deploy
   that changes nothing changes no URL, so there is no `v=` number to bump by
   hand any more.
5. `sw.js` gets the commit sha, which rolls the offline cache.

To try it locally:

```sh
mkdir -p _site && cp index.html sol-decode.js app.js i18n.js boot.js ui.js sw.js iris.css \
  favicon.svg health.json manifest.webmanifest robots.txt sitemap.xml _site/
python3 icons.py && python3 lockup.py
cd _site && python3 -m http.server 8137
```

Adding a string: put it in `UI.en` in `i18n.js`, then in the other five
blocks, and reference it from the markup with `data-i18n="key"` (or
`data-i18n-ph` for a placeholder). `applyI18n()` does the rest.
