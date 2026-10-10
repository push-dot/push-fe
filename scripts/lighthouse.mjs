import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'

const PORT = Number(process.env.LH_PORT ?? 4173)
const URL = `http://localhost:${PORT}/`
const REPORT_DIR = 'lighthouse'

// Category score budgets (0-100). Tighten these as scores improve.
const BUDGETS = {
  performance: Number(process.env.LH_BUDGET_PERFORMANCE ?? 80),
  accessibility: Number(process.env.LH_BUDGET_ACCESSIBILITY ?? 95),
  'best-practices': Number(process.env.LH_BUDGET_BEST_PRACTICES ?? 90),
  seo: Number(process.env.LH_BUDGET_SEO ?? 75),
}

const run = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    )
  })

const waitForServer = async (url, tries = 50) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`server at ${url} did not respond`)
}

// CHROME_PATH wins; otherwise fall back to Playwright's cached Chromium so the
// audit runs on machines without a Chrome install.
const playwrightChromium = () => {
  const cache = join(homedir(), 'Library/Caches/ms-playwright')
  if (!existsSync(cache)) return undefined
  for (const dir of readdirSync(cache)) {
    if (!dir.startsWith('chromium-')) continue
    for (const sub of readdirSync(join(cache, dir))) {
      if (!sub.startsWith('chrome-mac')) continue
      const base = join(cache, dir, sub)
      for (const app of readdirSync(base)) {
        const bin = join(base, app, 'Contents/MacOS', app.replace(/\.app$/, ''))
        if (app.endsWith('.app') && existsSync(bin)) return bin
      }
    }
  }
  return undefined
}

const main = async () => {
  if (!existsSync('dist/index.html')) {
    console.log('dist/ missing — running npm run build')
    await run('npm', ['run', 'build'])
  }

  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  preview.stdout.on('data', () => {})

  let chrome
  try {
    await waitForServer(URL)

    const chromePath = process.env.CHROME_PATH ?? playwrightChromium()
    chrome = await launch({
      ...(chromePath ? { chromePath } : {}),
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    })

    console.log(`auditing ${URL}`)
    const result = await lighthouse(URL, {
      port: chrome.port,
      preset: 'desktop',
      output: ['html', 'json'],
      logLevel: 'error',
    })
    if (!result) throw new Error('lighthouse returned no result')

    const { lhr, report } = result
    mkdirSync(REPORT_DIR, { recursive: true })
    writeFileSync(join(REPORT_DIR, 'report.html'), report[0])
    writeFileSync(join(REPORT_DIR, 'report.json'), report[1])
    console.log(`reports written to ${REPORT_DIR}/`)

    const failures = []
    for (const [name, budget] of Object.entries(BUDGETS)) {
      const cat = lhr.categories[name]
      if (!cat) continue
      const score = Math.round(cat.score * 100)
      const ok = score >= budget
      console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${score} (budget >= ${budget})`)
      if (!ok) failures.push(name)
    }

    const auditDetails = Object.values(lhr.audits).filter(
      (a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable',
    )
    if (auditDetails.length > 0) {
      console.log('\nnot-perfect audits:')
      for (const a of auditDetails) console.log(`  - ${a.id}: ${a.title}`)
    }

    if (failures.length > 0) {
      throw new Error(`budget(s) missed: ${failures.join(', ')}`)
    }
  } finally {
    await chrome?.kill()
    preview.kill()
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
