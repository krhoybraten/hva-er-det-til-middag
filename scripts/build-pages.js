import { cp, mkdir } from 'node:fs/promises'

// Publish only browser assets, never node_modules or the MCP server.
await mkdir('_site', { recursive: true })
for (const asset of ['index.html', 'main.js', 'sw.js', 'manifest.webmanifest',
  'api', 'css', 'data', 'icons', 'ui', 'utils']) {
  await cp(asset, `_site/${asset}`, { recursive: true })
}
