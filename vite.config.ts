import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { sealAll } from './scripts/seal.mjs'

/** Re-seals content/ into public/vault/ on startup and whenever a content file changes in dev. */
function sealVaults(): Plugin {
  const root = process.cwd()
  const contentDir = path.resolve(root, 'content')
  let queue: Promise<unknown> = Promise.resolve()

  return {
    name: 'seal-vaults',
    async buildStart() {
      await sealAll({ root })
    },
    configureServer(server) {
      server.watcher.add(contentDir)
      const onChange = (file: string) => {
        const rel = path.relative(contentDir, path.resolve(file))
        if (rel.startsWith('..') || path.isAbsolute(rel)) return
        queue = queue
          .then(() => sealAll({ root, log: (m) => server.config.logger.info(m) }))
          .then(() => server.ws.send({ type: 'full-reload' }))
          .catch((err) => server.config.logger.error(String(err?.message ?? err)))
      }
      server.watcher.on('add', onChange)
      server.watcher.on('change', onChange)
      server.watcher.on('unlink', onChange)
    },
  }
}

export default defineConfig({
  // Relative base + hash routing = works on GitHub Pages under any repo name.
  base: './',
  plugins: [react(), sealVaults()],
})
