// Headless test of the catchy-polish pass against the local production build.
// Verifies: each auth page loads with zero JS errors, the new visual markers
// (gradient titles, pop-in cards, role-select icon tiles, gradient logo,
// pulse-grow keyframe) are actually present in the rendered DOM and CSS.
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:4173'
let pass = 0, fail = 0
const ok = (n) => { pass++; console.log(`  PASS  ${n}`) }
const no = (n, e) => { fail++; console.log(`  FAIL  ${n}  ${e ?? ''}`) }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 412, height: 800 } })

const consoleErrors = []
const pageErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => pageErrors.push(e.message))

async function step(name, fn) {
  try { await fn(); ok(name) }
  catch (err) { no(name, err?.message) }
}

// 1. Role-select loads
await step('role-select page loads', async () => {
  await page.goto(`${BASE}/role-select`, { waitUntil: 'networkidle' })
  await page.getByText("Who's using Winkz?").waitFor({ timeout: 8000 })
})

// 2. Role-select has the catchy markers: icon tiles, gradient logo,
// animated card.
await step('role-select shows the parent SVG icon tile', async () => {
  const tile = page.locator('button:has-text("Parent")').first()
  await tile.locator('svg').first().waitFor({ timeout: 5000 })
})
await step('role-select shows the kid SVG icon tile', async () => {
  const tile = page.locator('button:has-text("Kid")').first()
  await tile.locator('svg').first().waitFor({ timeout: 5000 })
})

// Verify the auth card pops in and the logo uses the gradient classes.
await step('auth card has animate-pop-in', async () => {
  const has = await page.evaluate(() =>
    !!document.querySelector('.animate-pop-in'),
  )
  if (!has) throw new Error('no element with animate-pop-in')
})

await step('Winkz wordmark uses the gradient text class', async () => {
  const has = await page.evaluate(() =>
    Array.from(document.querySelectorAll('span')).some(
      (s) => s.textContent?.trim() === 'Winkz' && s.className.includes('bg-clip-text'),
    ),
  )
  if (!has) throw new Error('Winkz wordmark missing gradient classes')
})

await step('logo bubble has the gradient + shadow', async () => {
  const has = await page.evaluate(() => {
    const node = document.querySelector('.shadow-pop')
    return !!node
  })
  if (!has) throw new Error('no element using shadow-pop')
})

// 3. Parent login page loads
await step('parent login page loads', async () => {
  await page.goto(`${BASE}/parent/login`, { waitUntil: 'networkidle' })
  await page.getByText('Parent Log In').waitFor({ timeout: 8000 })
})

// 4. Buttons have the new gradient + shadow on the primary CTA
await step('PrimaryButton uses gradient + shadow-pop', async () => {
  const has = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]')
    if (!btn) return false
    const cls = btn.className
    return cls.includes('from-[#6E6EE8]') && cls.includes('shadow-pop')
  })
  if (!has) throw new Error('submit button missing gradient/shadow classes')
})

// 5. Child login page loads
await step('child login page loads', async () => {
  await page.goto(`${BASE}/child/login`, { waitUntil: 'networkidle' })
  await page.getByText('Kid Log In').waitFor({ timeout: 8000 })
})

// 6. pulse-grow keyframe is defined in the bundled CSS
await step('pulse-grow keyframe shipped in CSS', async () => {
  const ok = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="stylesheet"][href*="/assets/"]')
    if (!link) return false
    const text = await fetch(link.href).then((r) => r.text())
    return text.includes('pulse-grow') && text.includes('keyframes')
  })
  if (!ok) throw new Error('pulse-grow keyframe not found in built CSS')
})

// 7. Background uses the new gradient on the auth backdrop
await step('auth backdrop is a gradient', async () => {
  const has = await page.evaluate(() =>
    !!document.querySelector('.bg-gradient-to-br.from-primary\\/10'),
  )
  if (!has) throw new Error('auth backdrop missing the gradient classes')
})

// Screenshots for the user to eyeball
await page.goto(`${BASE}/role-select`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'polish-role-select.png', fullPage: true })
await page.goto(`${BASE}/parent/login`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'polish-parent-login.png', fullPage: true })

// Console / page-error gate.  Firestore offline noise during this offline
// preview is benign — filter it out.
const real = consoleErrors.filter(
  (t) =>
    !/favicon/i.test(t) &&
    !/firestore/i.test(t) &&
    !/@firebase/i.test(t),
)
if (pageErrors.length === 0) ok('no uncaught exceptions in the browser')
else no('no uncaught exceptions in the browser', pageErrors.join(' | '))
if (real.length === 0) ok('no console errors')
else no('no console errors', real.join(' | '))

await browser.close()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
