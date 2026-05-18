import { useState, useEffect } from 'react'
import { DemoProvider, useDemo } from './context/DemoContext'
import RoleSelect from './pages/RoleSelect'
import DemoLogin from './pages/DemoLogin'
import ParentHome from './pages/ParentHome'
import ChildHome from './pages/ChildHome'

type AuthPage = 'role-select' | 'parent-login' | 'child-login'

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-xl anim-slide-up">
      {msg}
    </div>
  )
}

function Celebration({ msg }: { msg: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 anim-fade-in">
      <div className="rounded-3xl bg-white p-10 text-center shadow-2xl anim-pop-in">
        <div className="mb-3 text-7xl">🎉</div>
        <div className="text-2xl font-extrabold text-primary">{msg}</div>
        <div className="mt-2 text-gray-500">Check your Backpack!</div>
      </div>
    </div>
  )
}

function Inner() {
  const { state, dispatch, currentUser } = useDemo()
  const [authPage, setAuthPage] = useState<AuthPage>('role-select')

  useEffect(() => {
    if (!currentUser) setAuthPage('role-select')
  }, [currentUser])

  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000)
    return () => clearTimeout(t)
  }, [state.toast, dispatch])

  useEffect(() => {
    if (!state.celebration) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_CELEBRATION' }), 2800)
    return () => clearTimeout(t)
  }, [state.celebration, dispatch])

  return (
    <>
      {currentUser?.role === 'parent' && <ParentHome />}
      {currentUser?.role === 'child' && <ChildHome />}
      {!currentUser && authPage === 'role-select' && (
        <RoleSelect onParent={() => setAuthPage('parent-login')} onChild={() => setAuthPage('child-login')} />
      )}
      {!currentUser && authPage === 'parent-login' && (
        <DemoLogin role="parent" onBack={() => setAuthPage('role-select')} />
      )}
      {!currentUser && authPage === 'child-login' && (
        <DemoLogin role="child" onBack={() => setAuthPage('role-select')} />
      )}
      {state.toast && <Toast msg={state.toast} />}
      {state.celebration && <Celebration msg={state.celebration} />}
    </>
  )
}

export default function App() {
  return <DemoProvider><Inner /></DemoProvider>
}
