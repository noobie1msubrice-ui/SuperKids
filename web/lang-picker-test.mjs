// Headless test of the first-visit language picker.
import { chromium } from 'playwright'

const BASE = 'http://localhost:4173'
let pass = 0, fail = 0
const ok = (n) => { pass++; console.log(`  PASS  ${n}`) }
const no = (n, e) => { fail++; console.log(`  FAIL  ${n}  ${e ?? ''}`) }

const browser = await chromium.launch()
async function step(name, fn) { try { await fn(); ok(name) } catch (err) { no(name, err?.message) } }

const pageErrors = []
const consoleErrors = []

// --- A. First visit (no language stored): picker should appear ---
const ctxA = await browser.newContext({ viewport: { width: 412, height: 800 } })
const a = await ctxA.newPage()
a.on('pageerror', (e) => pageErrors.push('A:' + e.message))
a.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('A:' + m.text()) })

await step('A1. fresh visit lands on the language picker', async () => {
  await a.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await a.getByText('Choose your language').waitFor({ timeout: 8000 })
  await a.getByText('Chọn ngôn ngữ của bạn').waitFor({ timeout: 2000 })
  if (!a.url().endsWith('/language')) throw new Error('URL: ' + a.url())
})

await step('A2. shows both English + Tiếng Việt buttons', async () => {
  await a.getByRole('button', { name: /English/ }).waitFor({ timeout: 3000 })
  await a.getByRole('button', { name: /Tiếng Việt/ }).waitFor({ timeout: 3000 })
})

await step('A3. picking Tiếng Việt navigates to role-select in Vietnamese', async () => {
  await a.getByRole('button', { name: /Tiếng Việt/ }).click()
  await a.waitForURL('**/role-select', { timeout: 5000 })
  await a.getByText('Ai đang dùng Winkz?').waitFor({ timeout: 5000 })
})

await step('A4. winkz.lang stored as vi', async () => {
  const stored = await a.evaluate(() => localStorage.getItem('winkz.lang'))
  if (stored !== 'vi') throw new Error('expected vi, got ' + stored)
})

await step('A5. revisiting / skips the picker (lang already chosen)', async () => {
  await a.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await a.waitForURL('**/role-select', { timeout: 5000 })
  await a.getByText('Ai đang dùng Winkz?').waitFor({ timeout: 5000 })
})
await ctxA.close()

// --- B. Fresh context (no storage) — pick English path ---
const ctxB = await browser.newContext({ viewport: { width: 412, height: 800 } })
const b = await ctxB.newPage()
b.on('pageerror', (e) => pageErrors.push('B:' + e.message))
b.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('B:' + m.text()) })

await step('B1. picking English navigates to role-select in English', async () => {
  await b.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await b.getByText('Choose your language').waitFor({ timeout: 8000 })
  await b.getByRole('button', { name: /^EN\s+English$/ }).click()
  await b.waitForURL('**/role-select', { timeout: 5000 })
  await b.getByText("Who's using Winkz?").waitFor({ timeout: 5000 })
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
