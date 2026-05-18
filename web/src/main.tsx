import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

// NOTE: React.StrictMode is intentionally omitted. Its dev-only double-mount
// resubscribes Firestore onSnapshot listeners near-synchronously, which trips
// a "FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state" bug in the SDK's
// watch-stream target tracking. Production mounts once, so this is dev-only.
createRoot(document.getElementById('root')!).render(<App />)
