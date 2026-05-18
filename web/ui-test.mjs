// Headless-browser UI test: drives the real React app like a user would,
// and fails on any uncaught exception or console error.
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const stamp = Date.now()
const parentEmail = `uiparent${stamp}@test.com`
const PASS = 'test1234'

let pass = 0, fail = 0
const ok = (n) => { pass++; console.log(`  PASS  ${n}`) }
const no = (n, e) => { fail++; console.log(`  FAIL  ${n}  ${e ?? ''}`) }

const consoleErrors = []
const pageErrors = []

const browser = await chromium.launch()
const page = await browser.newPage()

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => pageErrors.push(err.message))

async function step(name, fn) {
  try { await fn(); ok(name) }
  catch (err) { no(name, err?.message) }
}

try {
  // 1. App loads on the role picker
  await step('app loads — role picker visible', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByText("Who's using Winkz?").waitFor({ timeout: 15000 })
  })

  // 2. Parent path -> login screen
  await step('"I\'m a Parent" opens the login screen', async () => {
    await page.getByText("I'm a Parent").click()
    await page.getByText('Parent Log In').waitFor({ timeout: 8000 })
  })

  // 3. Go to signup
  await step('"Create an account" opens signup', async () => {
    await page.getByText('Create an account').click()
    await page.getByText('Create your account').waitFor({ timeout: 8000 })
  })

  // 4. Fill and submit signup
  await step('parent can sign up and land on Tasks', async () => {
    await page.getByLabel('Your name').fill('UI Test Parent')
    await page.getByLabel('Email').fill(parentEmail)
    await page.getByLabel('Password', { exact: true }).fill(PASS)
    await page.getByLabel('Confirm password').fill(PASS)
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.getByRole('heading', { name: 'Tasks' }).waitFor({ timeout: 12000 })
  })

  // 5. Empty Tasks page prompts to add a child
  await step('empty Tasks page prompts to add a child', async () => {
    await page.getByText('Add a child first', { exact: false }).waitFor({ timeout: 8000 })
  })

  // 6. Navigate to Family
  await step('Family tab opens', async () => {
    await page.getByRole('link', { name: 'Family' }).click()
    await page.getByRole('heading', { name: 'Family' }).waitFor({ timeout: 8000 })
  })

  // 7. Add a child
  await step('parent can add a child account', async () => {
    await page.getByRole('button', { name: 'Add Child' }).first().click()
    await page.getByRole('heading', { name: 'Add a Child' }).waitFor({ timeout: 8000 })
    await page.getByLabel("Child's name").fill('UI Kid')
    await page.getByLabel('Login email').fill(`uikid${stamp}@test.com`)
    await page.getByLabel('Password', { exact: true }).fill(PASS)
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.getByText('Child added!').waitFor({ timeout: 15000 })
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByText('UI Kid').waitFor({ timeout: 10000 })
  })

  // 8. Add a task for the child
  await step('parent can add a task', async () => {
    await page.getByRole('link', { name: 'Tasks' }).click()
    await page.getByRole('button', { name: 'Add Task' }).first().click()
    await page.getByRole('heading', { name: 'Add Task' }).waitFor({ timeout: 8000 })
    await page.getByLabel('Task title').fill('Make the bed')
    await page.selectOption('select#childId', { label: 'UI Kid' })
    await page.getByRole('button', { name: 'Add Task' }).click()
    await page.getByText('Make the bed').waitFor({ timeout: 10000 })
  })

  // 9. Store and Profile tabs render without crashing
  await step('Store tab renders', async () => {
    await page.getByRole('link', { name: 'Store' }).click()
    await page.getByRole('heading', { name: 'Store' }).waitFor({ timeout: 8000 })
  })
  await step('Profile tab renders', async () => {
    await page.getByRole('link', { name: 'Profile' }).click()
    await page.getByRole('heading', { name: 'Profile' }).waitFor({ timeout: 8000 })
  })

  // 9b. The Winkz logo links back to the home menu
  await step('clicking the Winkz logo returns to the home menu', async () => {
    await page.getByRole('link', { name: 'Go to home' }).click()
    await page.getByRole('heading', { name: 'Tasks' }).waitFor({ timeout: 8000 })
  })

  // 10. Hidden admin entry point
  await step('typing "admin" opens the Admin dialog', async () => {
    // Not networkidle: a signed-in session keeps a live Firestore stream open.
    await page.goto(`${BASE}/role-select`, { waitUntil: 'domcontentloaded' })
    await page.getByText("Who's using Winkz?").waitFor({ timeout: 8000 })
    await page.keyboard.type('admin')
    await page.getByRole('dialog', { name: 'Admin' }).waitFor({ timeout: 8000 })
  })

  // 11. Admin signup is restricted to the email allow-list
  await step('admin signup rejects a non-allow-listed email', async () => {
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Your name').fill('Intruder')
    await page.getByLabel('Email').fill('intruder@test.com')
    await page.getByLabel('Password', { exact: true }).fill('test1234')
    await page.getByLabel('Confirm password').fill('test1234')
    await page.getByRole('button', { name: 'Create Admin Account' }).click()
    await page
      .getByText('not authorized for admin access')
      .waitFor({ timeout: 8000 })
  })

  await page.screenshot({ path: 'ui-test-result.png', fullPage: true })
} catch (err) {
  no('unexpected failure', err?.message)
}

// Console / page-error gate. Ignore benign favicon noise.
const realConsole = consoleErrors.filter((t) => !/favicon/i.test(t))
if (pageErrors.length === 0) ok('no uncaught exceptions in the browser')
else no('no uncaught exceptions in the browser', pageErrors.join(' | '))
if (realConsole.length === 0) ok('no console errors')
else no('no console errors', realConsole.join(' | '))

await browser.close()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
