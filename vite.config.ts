import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** https://github.com/<owner>/<repo> for "Edit tasks" links: from CI, else from the git remote. */
function portalRepo(): string {
  if (process.env.GITHUB_REPOSITORY) return `https://github.com/${process.env.GITHUB_REPOSITORY}`
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    const m = /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/.exec(url)
    return m ? `https://github.com/${m[1]}` : ''
  } catch {
    return ''
  }
}

// `base: './'` + HashRouter lets the same build run on GitHub Pages (sub-path),
// Netlify, Vercel, or any static file host without rewrite rules.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  define: {
    __PORTAL_REPO__: JSON.stringify(portalRepo()),
    __PORTAL_BRANCH__: JSON.stringify(process.env.GITHUB_REF_NAME || 'main'),
  },
})
