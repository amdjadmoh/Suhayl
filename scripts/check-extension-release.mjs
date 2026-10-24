#!/usr/bin/env node
// Fails when the extension build in extension/.output is not fit to publish:
// localhost addresses, remote dev-server scripts, broad host permissions or the
// dev reload command. Run after `wxt build` and before zipping for the Web Store.
//   node scripts/check-extension-release.mjs [path-to-build]
import fs from "node:fs"
import path from "node:path"

const dir = path.resolve(process.argv[2] ?? "extension/.output/chrome-mv3")
if (!fs.existsSync(path.join(dir, "manifest.json"))) {
  console.error(`No extension build at ${dir}. Run the production build first.`)
  process.exit(1)
}

const problems = []
const LOCAL = /\b(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?/g

function walk(d) {
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(js|html|json|css)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8")
      const hits = [...new Set(text.match(LOCAL) ?? [])]
      if (hits.length) problems.push(`${path.relative(dir, full)}: mentions ${hits.join(", ")}`)
      if (entry.name.endsWith(".html") && /<script[^>]+src=["']https?:/i.test(text)) problems.push(`${path.relative(dir, full)}: loads a remote script`)
    }
  }
}
walk(dir)

const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"))
const hosts = [...(manifest.host_permissions ?? []), ...(manifest.content_scripts ?? []).flatMap((c) => c.matches ?? [])]
for (const h of hosts) {
  if (h === "<all_urls>" || /^\*:\/\/\*\//.test(h) || /^https?:\/\/\*\//.test(h)) problems.push(`manifest: host pattern "${h}" covers every site`)
}
const csp = JSON.stringify(manifest.content_security_policy ?? {})
if (/https?:\/\//.test(csp)) problems.push("manifest: content_security_policy allows remote script origins")
if (manifest.commands?.["wxt:reload-extension"]) problems.push("manifest: development reload command is still present")

if (problems.length) {
  console.error(`Extension build is not releasable (${dir}):\n  - ${problems.join("\n  - ")}`)
  process.exit(1)
}
console.log(`Extension build OK: ${dir}`)
