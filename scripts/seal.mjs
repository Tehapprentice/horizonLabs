// Reads content/ (plaintext Markdown + vaults.json) and writes encrypted
// vault files to public/vault/. Run with `npm run seal`; `npm run dev` and
// `npm run build` also run it automatically when content/ exists.
//
// content/ is gitignored, so the plaintext never reaches your public repo.
// Only the encrypted public/vault/*.json files get committed and deployed.

import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'
import { sealJson, openJson } from '../src/lib/vaultCrypto.js'

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/

marked.use({ gfm: true })

/** Frontmatter values → display strings. Unquoted YAML dates become Date objects, so undo that. */
function str(value) {
  if (value === undefined || value === null || value === '') return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

async function loadDocs(dir) {
  if (!existsSync(dir)) return []
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith('.md')).sort()
  const docs = []
  for (const name of files) {
    const { data, content } = matter(await readFile(path.join(dir, name), 'utf8'))
    if (data.draft) continue
    const slug = name
      .replace(/\.md$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
    const defaultFile = slug.replace(/^\d+[-_]?/, '').replace(/-/g, '_').toUpperCase() + '.TXT'
    docs.push({
      slug,
      file: str(data.file) ?? defaultFile,
      title: str(data.title) ?? str(data.file) ?? defaultFile,
      classification: str(data.classification),
      date: str(data.date),
      author: str(data.author),
      priority: data.priority ? true : undefined,
      theme: str(data.theme)?.toLowerCase().replace(/[^a-z0-9-]+/g, '') || undefined,
      html: await marked.parse(content),
    })
  }
  return docs
}

export async function sealAll({ root = process.cwd(), log = console.log } = {}) {
  const contentDir = path.join(root, 'content')
  const configPath = path.join(contentDir, 'vaults.json')
  const outDir = path.join(root, 'public', 'vault')

  if (!existsSync(configPath)) {
    if (!existsSync(path.join(outDir, 'main.json'))) {
      throw new Error(
        '[seal] No content/vaults.json and no sealed public/vault/main.json. ' +
          'Run `npm run seal` locally and commit public/vault/.',
      )
    }
    log('[seal] content/ not found; using the committed public/vault files.')
    return { skipped: true, changed: [] }
  }

  const config = JSON.parse(await readFile(configPath, 'utf8'))
  const ids = Object.keys(config)
  if (!config.main) throw new Error('[seal] content/vaults.json must define a "main" vault.')
  for (const id of ids) {
    if (!ID_PATTERN.test(id)) throw new Error(`[seal] Vault id "${id}" must be lowercase letters, digits, - or _.`)
    if (!config[id].passphrase) throw new Error(`[seal] Vault "${id}" needs a "passphrase".`)
  }

  await mkdir(outDir, { recursive: true })
  const changed = []

  for (const id of ids) {
    const cfg = config[id]
    const payload = {
      id,
      title: str(cfg.title) ?? id.toUpperCase(),
      greeting: str(cfg.greeting),
      docs: await loadDocs(path.join(contentDir, id)),
    }
    if (id === 'main') {
      payload.locked = ids
        .filter((other) => other !== 'main')
        .map((other) => ({
          id: other,
          label: str(config[other].title) ?? other.toUpperCase(),
          hint: str(config[other].hint) ?? null,
        }))
    }

    // Skip rewriting when nothing changed, so git diffs stay quiet.
    const outFile = path.join(outDir, `${id}.json`)
    if (existsSync(outFile)) {
      try {
        const previous = await openJson(JSON.parse(await readFile(outFile, 'utf8')), cfg.passphrase)
        if (previous && JSON.stringify(previous) === JSON.stringify(payload)) continue
      } catch {
        // unreadable old file: just overwrite it
      }
    }
    await writeFile(outFile, JSON.stringify(await sealJson(payload, cfg.passphrase)) + '\n')
    changed.push(id)
  }

  for (const file of await readdir(outDir)) {
    if (file.endsWith('.json') && !ids.includes(file.slice(0, -5))) {
      await rm(path.join(outDir, file))
      changed.push(`removed ${file}`)
    }
  }

  log(changed.length ? `[seal] sealed: ${changed.join(', ')}` : '[seal] vaults up to date')
  return { skipped: false, changed }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  sealAll().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
