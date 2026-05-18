// Backend test of admin powers + the rule changes behind the Family-page fix.
import { initializeApp } from 'firebase/app'
import {
  getAuth, connectAuthEmulator,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  getFirestore, connectFirestoreEmulator,
  doc, setDoc, addDoc, getDoc, getDocs, deleteDoc, updateDoc,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions'

const app = initializeApp({ apiKey: 'demo-emulator-key', projectId: 'superkids-dev' })
const auth = getAuth(app)
const db = getFirestore(app)
const fns = getFunctions(app, 'us-central1')
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
connectFirestoreEmulator(db, '127.0.0.1', 8080)
connectFunctionsEmulator(fns, '127.0.0.1', 5001)

const s = Date.now()
const PASS = 'test1234'
let pass = 0, fail = 0
const ok = (n) => { pass++; console.log(`  PASS  ${n}`) }
const no = (n, e) => { fail++; console.log(`  FAIL  ${n}  ${e ?? ''}`) }

async function denied(name, fn) {
  try { await fn(); no(name, 'expected denial but it succeeded') }
  catch { ok(name) }
}

async function signupParent(email) {
  const { user } = await createUserWithEmailAndPassword(auth, email, PASS)
  await setDoc(doc(db, 'users', user.uid), {
    role: 'parent', displayName: 'P', email, createdAt: serverTimestamp(),
  })
  return user.uid
}

try {
  // --- Two families ---
  const parentA = await signupParent(`pa${s}@t.com`)
  const childA = (await httpsCallable(fns, 'createChildAccount')(
    { displayName: 'KidA', email: `ca${s}@t.com`, password: PASS })).data.childUid
  const parentB = await signupParent(`pb${s}@t.com`)

  // --- Regression: a parent CAN list their own children ---
  await signInWithEmailAndPassword(auth, `pa${s}@t.com`, PASS)
  const myKids = await getDocs(
    query(collection(db, 'users'), where('parentId', '==', parentA)),
  )
  if (myKids.size === 1) ok('parent can list their own children')
  else no('parent can list their own children', `got ${myKids.size}`)

  // --- Security: a parent cannot read another family's child ---
  await signInWithEmailAndPassword(auth, `pb${s}@t.com`, PASS)
  await denied('parent cannot read another family child', async () => {
    const snap = await getDoc(doc(db, 'users', childA))
    if (!snap.exists()) throw new Error('denied')
  })

  // --- Security: a parent cannot list every user ---
  await denied('parent cannot list all users', () =>
    getDocs(collection(db, 'users')),
  )

  // --- Admin account: create fresh on an allow-listed email, or reuse one ---
  const ADMIN_EMAILS = ['noobie1msubrice@gmail.com', 'lamlam3019@gmail.com']
  let adminReady = false
  for (const email of ADMIN_EMAILS) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, PASS)
      await setDoc(doc(db, 'users', user.uid), {
        role: 'admin', displayName: 'Boss', email, createdAt: serverTimestamp(),
      })
      adminReady = true
      break
    } catch {
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, PASS)
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!snap.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            role: 'admin', displayName: 'Boss', email, createdAt: serverTimestamp(),
          })
        }
        adminReady = true
        break
      } catch {
        /* email taken with an unknown password — try the next one */
      }
    }
  }
  if (adminReady) ok('admin session established on an allow-listed email')
  else no('admin session established on an allow-listed email', 'both admin emails unusable')

  // --- Admin full control ---
  const allUsers = await getDocs(collection(db, 'users'))
  if (allUsers.size >= 4) ok('admin can list every user')
  else no('admin can list every user', `only ${allUsers.size}`)

  const allTasks = await getDocs(collection(db, 'tasks'))
  ok(`admin can list every task (${allTasks.size})`)

  await updateDoc(doc(db, 'users', childA), { starBalance: 777 })
  const edited = await getDoc(doc(db, 'users', childA))
  if (edited.data().starBalance === 777) ok('admin can set any child star balance')
  else no('admin can set any child star balance', `got ${edited.data().starBalance}`)

  const throwaway = await addDoc(collection(db, 'tasks'), {
    parentId: parentA, childId: childA, title: 'temp', starReward: 1,
    status: 'available', createdAt: serverTimestamp(),
  })
  await deleteDoc(doc(db, 'tasks', throwaway.id))
  const gone = await getDoc(doc(db, 'tasks', throwaway.id))
  if (!gone.exists()) ok('admin can delete any task')
  else no('admin can delete any task')

  // --- A non-allow-listed email cannot become admin ---
  await denied('non-allow-listed email cannot create an admin profile', async () => {
    const { user } = await createUserWithEmailAndPassword(auth, `intruder${s}@t.com`, PASS)
    await setDoc(doc(db, 'users', user.uid), {
      role: 'admin', displayName: 'X', email: `intruder${s}@t.com`,
      createdAt: serverTimestamp(),
    })
  })
} catch (err) {
  no('unexpected error', `${err?.code ?? ''} ${err?.message ?? err}`)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
