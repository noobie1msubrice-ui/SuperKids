import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { UserProfile, Task, StoreItem, BackpackItem, Transaction } from '../types'

// ── State ────────────────────────────────────────────────────────────────────

interface DemoState {
  currentUserId: string | null
  users: UserProfile[]
  tasks: Task[]
  storeItems: StoreItem[]
  backpackItems: BackpackItem[]
  transactions: Transaction[]
  toast: string | null
  celebration: string | null
}

type Action =
  | { type: 'LOGIN'; userId: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'status' | 'createdAt'> }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'MARK_DONE'; taskId: string }
  | { type: 'APPROVE_TASK'; taskId: string }
  | { type: 'REJECT_TASK'; taskId: string }
  | { type: 'ADD_STORE_ITEM'; payload: Omit<StoreItem, 'id'> }
  | { type: 'TOGGLE_ITEM'; itemId: string }
  | { type: 'DELETE_ITEM'; itemId: string }
  | { type: 'PURCHASE'; itemId: string }
  | { type: 'REQUEST_REDEEM'; backpackId: string }
  | { type: 'MARK_REDEEMED'; backpackId: string }
  | { type: 'ADD_CHILD'; displayName: string; email: string; parentId: string }
  | { type: 'CLEAR_TOAST' }
  | { type: 'CLEAR_CELEBRATION' }

// ── Seed data ────────────────────────────────────────────────────────────────

const USERS: UserProfile[] = [
  { id: 'p1', role: 'parent', displayName: 'Alex', email: 'alex@demo.com' },
  { id: 'c1', role: 'child', displayName: 'Sam', email: 'sam@demo.com', parentId: 'p1', starBalance: 25 },
  { id: 'c2', role: 'child', displayName: 'Mia', email: 'mia@demo.com', parentId: 'p1', starBalance: 10 },
]

const now = Date.now()
const hr = 3_600_000

const TASKS: Task[] = [
  { id: 't1', parentId: 'p1', childId: 'c1', title: 'Make your bed', description: 'Pillows tidy too!', starReward: 5, status: 'available', createdAt: now - hr * 2 },
  { id: 't2', parentId: 'p1', childId: 'c1', title: 'Do homework', description: 'All subjects done!', starReward: 10, status: 'pending_approval', createdAt: now - hr * 5 },
  { id: 't3', parentId: 'p1', childId: 'c1', title: 'Tidy your room', starReward: 8, status: 'completed', createdAt: now - hr * 24 },
  { id: 't4', parentId: 'p1', childId: 'c2', title: 'Feed the dog', description: 'Morning and evening', starReward: 8, status: 'available', createdAt: now - hr },
  { id: 't5', parentId: 'p1', childId: 'c2', title: 'Set the table', starReward: 3, status: 'available', createdAt: now - hr * 3 },
]

const ITEMS: StoreItem[] = [
  { id: 's1', parentId: 'p1', name: 'Extra Screen Time', description: '30 extra minutes tonight', starPrice: 20, emoji: '📱', isActive: true },
  { id: 's2', parentId: 'p1', name: 'Ice Cream', description: 'Any flavour you choose!', starPrice: 15, emoji: '🍦', isActive: true },
  { id: 's3', parentId: 'p1', name: 'Stay Up Late', description: '1 hour past bedtime', starPrice: 30, emoji: '🌙', isActive: true },
  { id: 's4', parentId: 'p1', name: 'Movie Night Pick', description: 'You choose the film!', starPrice: 25, emoji: '🎬', isActive: true },
]

const BACKPACK: BackpackItem[] = [
  { id: 'b1', childId: 'c1', parentId: 'p1', storeItemId: 's2', name: 'Ice Cream', emoji: '🍦', pricePaid: 15, status: 'redeem_requested', purchasedAt: now - hr * 3 },
]

const TRANSACTIONS: Transaction[] = [
  { id: 'tx1', childId: 'c1', type: 'earn', amount: 8, reason: 'Task: Tidy your room', balanceAfter: 40, createdAt: now - hr * 24 },
  { id: 'tx2', childId: 'c1', type: 'spend', amount: 15, reason: 'Bought: Ice Cream', balanceAfter: 25, createdAt: now - hr * 3 },
]

// ── Reducer ──────────────────────────────────────────────────────────────────

let nextId = 200
const uid = () => `gen_${nextId++}`

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUserId: action.userId }

    case 'LOGOUT':
      return { ...state, currentUserId: null }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [{ ...action.payload, id: uid(), status: 'available', createdAt: Date.now() }, ...state.tasks],
        toast: '✅ Task added!',
      }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.taskId) }

    case 'MARK_DONE':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, status: 'pending_approval' } : t),
        toast: '🙋 Marked as done — waiting for parent!',
      }

    case 'APPROVE_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId)
      if (!task) return state
      const newBalance = (state.users.find(u => u.id === task.childId)?.starBalance ?? 0) + task.starReward
      const childName = state.users.find(u => u.id === task.childId)?.displayName ?? 'Child'
      const txn: Transaction = { id: uid(), childId: task.childId, type: 'earn', amount: task.starReward, reason: `Task: ${task.title}`, balanceAfter: newBalance, createdAt: Date.now() }
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, status: 'completed' } : t),
        users: state.users.map(u => u.id === task.childId ? { ...u, starBalance: newBalance } : u),
        transactions: [txn, ...state.transactions],
        toast: `⭐ Approved! ${childName} earned ${task.starReward} Stars!`,
      }
    }

    case 'REJECT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, status: 'available' } : t),
        toast: '↩️ Task sent back — try again!',
      }

    case 'ADD_STORE_ITEM':
      return {
        ...state,
        storeItems: [{ ...action.payload, id: uid() }, ...state.storeItems],
        toast: '🏪 Store item added!',
      }

    case 'TOGGLE_ITEM':
      return {
        ...state,
        storeItems: state.storeItems.map(i => i.id === action.itemId ? { ...i, isActive: !i.isActive } : i),
      }

    case 'DELETE_ITEM':
      return { ...state, storeItems: state.storeItems.filter(i => i.id !== action.itemId) }

    case 'PURCHASE': {
      const child = state.users.find(u => u.id === state.currentUserId)
      const item = state.storeItems.find(i => i.id === action.itemId)
      if (!child || !item) return state
      const bal = child.starBalance ?? 0
      if (bal < item.starPrice) return { ...state, toast: '❌ Not enough Stars yet!' }
      const newBalance = bal - item.starPrice
      const bp: BackpackItem = { id: uid(), childId: child.id, parentId: child.parentId!, storeItemId: item.id, name: item.name, emoji: item.emoji, pricePaid: item.starPrice, status: 'owned', purchasedAt: Date.now() }
      const txn: Transaction = { id: uid(), childId: child.id, type: 'spend', amount: item.starPrice, reason: `Bought: ${item.name}`, balanceAfter: newBalance, createdAt: Date.now() }
      return {
        ...state,
        users: state.users.map(u => u.id === child.id ? { ...u, starBalance: newBalance } : u),
        backpackItems: [bp, ...state.backpackItems],
        transactions: [txn, ...state.transactions],
        celebration: `🎉 You bought ${item.emoji} ${item.name}!`,
      }
    }

    case 'REQUEST_REDEEM':
      return {
        ...state,
        backpackItems: state.backpackItems.map(b => b.id === action.backpackId ? { ...b, status: 'redeem_requested' } : b),
        toast: '🙋 Shown to parent!',
      }

    case 'MARK_REDEEMED':
      return {
        ...state,
        backpackItems: state.backpackItems.map(b => b.id === action.backpackId ? { ...b, status: 'redeemed' } : b),
        toast: '🎁 Marked as given!',
      }

    case 'ADD_CHILD': {
      const child: UserProfile = { id: uid(), role: 'child', displayName: action.displayName, email: action.email, parentId: action.parentId, starBalance: 0 }
      return { ...state, users: [...state.users, child], toast: `👦 ${action.displayName} added!` }
    }

    case 'CLEAR_TOAST':
      return { ...state, toast: null }

    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null }

    default:
      return state
  }
}

const INITIAL: DemoState = {
  currentUserId: null,
  users: USERS,
  tasks: TASKS,
  storeItems: ITEMS,
  backpackItems: BACKPACK,
  transactions: TRANSACTIONS,
  toast: null,
  celebration: null,
}

// ── Context ──────────────────────────────────────────────────────────────────

interface Ctx { state: DemoState; dispatch: React.Dispatch<Action>; currentUser: UserProfile | null }
const DemoContext = createContext<Ctx | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null
  return <DemoContext.Provider value={{ state, dispatch, currentUser }}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be inside DemoProvider')
  return ctx
}
