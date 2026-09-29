# Halcyon Archive

A zombie-outbreak party invite disguised as a failing research-lab terminal.
Vite + React + TypeScript, hosted on GitHub Pages.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173, re-encrypts content on every save
```

Default phrases in the sample content:

| Where | Phrase |
| --- | --- |
| Login | `forgoodofall` |
| Project Tithonus (hidden section) | `methuselah` |

Capitalization and spaces don't matter, so `For Good of All` works too.

## How the password works

The passphrase **is** the encryption key. Everything behind the login is AES-encrypted
at build time. The site ships only ciphertext, so "view source" shows nothing useful.
There are no accounts and no server.

- `content/` holds your plaintext Markdown and passphrases. It is **gitignored** and never
  leaves your computer. **Back it up somewhere private.**
- `public/vault/*.json` is the encrypted output. This is what you commit and deploy.
- Guests' browsers remember the phrase, so revisits skip the login.

This is strong enough to keep randoms and search engines out. It is not bank-grade, and a
short phrase could be brute-forced by a determined attacker. Don't put anything truly
sensitive in here beyond an address.

## Writing content

```
content/
  vaults.json          ← passphrases + section titles
  main/                ← files unlocked by the login phrase
    00-evacuation-order.md
    01-incident-log.md
  tithonus/            ← a hidden section with its own code
    01-director-journal.md
```

Files are listed in filename order. Each file starts with frontmatter:

```md
---
file: INCIDENT_LOG.TXT          # name shown in the directory listing
title: Automated Incident Log   # heading on the page
classification: LEVEL 3 // INTERNAL
date: "10.24.2026"              # quote dates
author: B4 Facility Monitor
priority: true                  # optional: amber "!!" highlight
theme: arcane                   # optional: violet occult color scheme
draft: true                     # optional: leave it out of the site
---
```

The rest is Markdown, with a few special effects:

| Write this | You get |
| --- | --- |
| `~~SECRET~~` | A redaction bar. Highlighting it reveals the text. This is how guests find codes. |
| `> quote` | A "recovered audio transcript" box |
| `<span class="corrupt">text</span>` | Glitching text |
| `<span class="alert">text</span>` | Red warning text |
| ```` ```text ```` block | A monospace log printout |
| `*word*` | Amber emphasis |
| `![photo](data:...)` or an image URL | Green-tinted "security camera" photo |

### Adding another hidden section

1. Add an entry to `content/vaults.json`:
   ```json
   "basement": { "passphrase": "some code", "title": "SUBLEVEL_B5", "hint": "Shown on the locked door." }
   ```
2. Create `content/basement/` and put Markdown files in it.
3. Hide the code somewhere in another file, for example inside a `~~redaction~~`.

The locked directory appears automatically in the archive index.

### Public text

The boot screen, login screen and status-bar ticker are visible to anyone, so they live
in `src/config.ts` rather than in the encrypted content. The company name and ASCII logo
are there too.

## Deploy to GitHub Pages

1. Create a GitHub repo and push this project to `main`. `content/` stays out automatically.
2. In the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds and deploys. The URL appears under **Settings → Pages**.

Before each push, run `npm run seal` (or just `npm run dev`) so `public/vault/` matches
your latest content, then commit it.

## Accessibility

The footer's **POWER STABILIZER** toggle turns off flicker, brownouts and motion. It is on
by default for visitors whose device asks for reduced motion.
