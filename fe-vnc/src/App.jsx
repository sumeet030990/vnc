import { Navigate, Route, Routes } from 'react-router'
import RequireAuth from './auth/RequireAuth.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything inside here needs a logged-in user. */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/commission-bills"
            element={<ComingSoonPage title="Commission Bill" />}
          />
          <Route path="/reports" element={<ComingSoonPage title="Reports" />} />
          <Route
            path="/sauda-book"
            element={<ComingSoonPage title="Sauda Book" />}
          />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<ComingSoonPage title="Roles" />} />
          <Route path="/items" element={<ComingSoonPage title="Items" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
