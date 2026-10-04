import { Navigate, Route, Routes } from 'react-router'
import RequireAuth from './auth/RequireAuth.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'
import ItemsPage from './pages/items/ItemsPage.jsx'
import CompaniesPage from './pages/companies/CompaniesPage.jsx'
import BillsPage from './pages/bills/BillsPage.jsx'
import BillFormPage from './pages/bills/BillFormPage.jsx'
import BillPrintPage from './pages/bills/BillPrintPage.jsx'
import ReportsPage from './pages/reports/ReportsPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything inside here needs a logged-in user. */}
      <Route element={<RequireAuth />}>
        {/* Printable bill: no app bar, so it sits outside the layout. */}
        <Route path="/commission-bills/:id/print" element={<BillPrintPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/commission-bills" element={<BillsPage />} />
          <Route path="/commission-bills/new" element={<BillFormPage />} />
          <Route path="/commission-bills/:id/edit" element={<BillFormPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
