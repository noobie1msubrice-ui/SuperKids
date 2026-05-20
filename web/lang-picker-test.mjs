// Headless test of the first-visit language popup that sits on top of the
// role-select screen.
import { chromium } from 'playwright'

const BASE = 'http://localhost:4173'
let pass = 0, fail = 0
const ok = (n) => { pass++; console.log(`  PASS  ${n}`) }
const no = (n, e) => { fail++; console.log(`  FAIL  ${n}  ${e ?? ''}`) }

const browser = await chromium.launch()
async function step(name, fn) { try { await fn(); ok(name) } catch (err) { no(name, err?.message) } }

const pageErrors = []
const consoleErrors = []

// --- A. First visit (no language stored): popup over role-select ---
const ctxA = await browser.newContext({ viewport: { width: 412, height: 800 } })
const a = await ctxA.newPage()
a.on('pageerror', (e) => pageErrors.push('A:' + e.message))
a.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('A:' + m.text()) })

await step('A1. fresh visit lands on /role-select with the popup over it', async () => {
  await a.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await a.waitForURL('**/role-select', { timeout: 5000 })
  // Popup is open
  const dialog = a.getByRole('dialog')
  await dialog.waitFor({ timeout: 5000 })
  await dialog.getByText('Choose your language').waitFor({ timeout: 2000 })
  await dialog.getByText('Chọn ngôn ngữ của bạn').waitFor({ timeout: 2000 })
})

await step('A2. popup shows both EN and VI buttons', async () => {
  const dialog = a.getByRole('dialog')
  await dialog.getByRole('button', { name: /English/ }).waitFor({ timeout: 3000 })
  await dialog.getByRole('button', { name: /Tiếng Việt/ }).waitFor({ timeout: 3000 })
})

await step('A3. picking Tiếng Việt closes the popup', async () => {
  await a.getByRole('button', { name: /Tiếng Việt/ }).click()
  // Dialog goes away
  await a.getByRole('dialog').waitFor({ state: 'detached', timeout: 3000 })
})

await step('A4. underlying role-select is now in Vietnamese', async () => {
  await a.getByText('Ai đang dùng Winkz?').waitFor({ timeout: 3000 })
})

await step('A5. winkz.lang stored as vi', async () => {
  const stored = await a.evaluate(() => localStorage.getItem('winkz.lang'))
  if (stored !== 'vi') throw new Error('expected vi, got ' + stored)
})

await step('A6. revisiting / skips the popup (lang already chosen)', async () => {
  await a.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await a.waitForURL('**/role-select', { timeout: 5000 })
  await a.getByText('Ai đang dùng Winkz?').waitFor({ timeout: 3000 })
  // No dialog this time
  const count = await a.getByRole('dialog').count()
  if (count !== 0) throw new Error('dialog still present after pick')
})
await ctxA.close()

// --- B. Fresh context — pick English path ---
const ctxB = await browser.newContext({ viewport: { width: 412, height: 800 } })
const b = await ctxB.newPage()
b.on('pageerror', (e) => pageErrors.push('B:' + e.message))
b.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('B:' + m.text()) })

await step('B1. picking English closes popup, role-select is English', async () => {
  await b.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await b.getByRole('dialog').waitFor({ timeout: 5000 })
  await b.getByRole('button', { name: /^EN\s+English$/ }).click()
  await b.getByRole('dialog').waitFor({ state: 'detached', timeout: 3000 })
  await b.getByText("Who's using Winkz?").waitFor({ timeout: 3000 })
})

await step('B2. winkz.lang stored as en', async () => {
  const stored = await b.evaluate(() => localStorage.getItem('winkz.lang'))
  if (stored !== 'en') throw new Error('expected en, got ' + stored)
})
await ctxB.close()

const real = consoleErrors.filter((t) => !/firestore|favicon|@firebase/i.test(t))
if (pageErrors.length === 0) ok('no uncaught exceptions across both flows')
else no('no uncaught exceptions', pageErrors.join(' | '))
if (real.length === 0) ok('no console errors across both flows')
else no('no console errors', real.join(' | '))

await browser.close()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
