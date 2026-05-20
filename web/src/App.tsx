import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './core/context/AuthContext'
import { ToastProvider } from './core/context/ToastContext'
import { LanguageProvider } from './core/i18n/LanguageContext'
import { ProtectedRoute } from './core/router/ProtectedRoute'
import { RootRedirect } from './core/router/RootRedirect'
import { NotFoundPage } from './core/router/NotFoundPage'
import { LanguageSelectPage } from './features/auth/pages/LanguageSelectPage'
import { RoleSelectPage } from './features/auth/pages/RoleSelectPage'
import { ParentLoginPage } from './features/auth/pages/ParentLoginPage'
import { ParentSignupPage } from './features/auth/pages/ParentSignupPage'
import { ChildLoginPage } from './features/auth/pages/ChildLoginPage'
import { ChildSignupPage } from './features/auth/pages/ChildSignupPage'
import { ChildWaitingPage } from './features/auth/pages/ChildWaitingPage'
import { ParentTasksPage } from './features/tasks/pages/ParentTasksPage'
import { AddTaskPage } from './features/tasks/pages/AddTaskPage'
import { EditTaskPage } from './features/tasks/pages/EditTaskPage'
import { ChildTasksPage } from './features/tasks/pages/ChildTasksPage'
import { ParentStoreItemsPage } from './features/store/pages/ParentStoreItemsPage'
import { AddEditStoreItemPage } from './features/store/pages/AddEditStoreItemPage'
import { ChildStorePage } from './features/store/pages/ChildStorePage'
import { FamilyPage } from './features/family/pages/FamilyPage'
import { AddChildPage } from './features/family/pages/AddChildPage'
import { LinkChildPage } from './features/family/pages/LinkChildPage'
import { ChildDetailPage } from './features/family/pages/ChildDetailPage'
import { BackpackPage } from './features/backpack/pages/BackpackPage'
import { ParentProfilePage } from './features/profile/pages/ParentProfilePage'
import { ChildProfilePage } from './features/profile/pages/ChildProfilePage'
import { AdminPanelPage } from './features/admin/pages/AdminPanelPage'

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/language" element={<LanguageSelectPage />} />
            <Route path="/role-select" element={<RoleSelectPage />} />
            <Route path="/parent/login" element={<ParentLoginPage />} />
            <Route path="/parent/signup" element={<ParentSignupPage />} />
            <Route path="/child/login" element={<ChildLoginPage />} />
            <Route path="/child/signup" element={<ChildSignupPage />} />
            <Route path="/child/waiting" element={<ChildWaitingPage />} />

            <Route element={<ProtectedRoute role="parent" />}>
              <Route path="/parent/tasks" element={<ParentTasksPage />} />
              <Route path="/parent/tasks/add" element={<AddTaskPage />} />
              <Route path="/parent/tasks/:taskId/edit" element={<EditTaskPage />} />
              <Route path="/parent/store" element={<ParentStoreItemsPage />} />
              <Route path="/parent/store/add" element={<AddEditStoreItemPage />} />
              <Route path="/parent/store/:itemId/edit" element={<AddEditStoreItemPage />} />
              <Route path="/parent/family" element={<FamilyPage />} />
              <Route path="/parent/family/add" element={<AddChildPage />} />
              <Route path="/parent/family/link" element={<LinkChildPage />} />
              <Route path="/parent/family/:childId" element={<ChildDetailPage />} />
              <Route path="/parent/profile" element={<ParentProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute role="child" />}>
              <Route path="/child/tasks" element={<ChildTasksPage />} />
              <Route path="/child/store" element={<ChildStorePage />} />
              <Route path="/child/backpack" element={<BackpackPage />} />
              <Route path="/child/profile" element={<ChildProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
