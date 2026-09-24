import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'

import HomePage from './pages/HomePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ChatbotPage from './pages/ChatbotPage.jsx'
import FaqPage from './pages/FaqPage.jsx'
import AnnouncementsPage from './pages/AnnouncementsPage.jsx'
import SubmitQuestionPage from './pages/SubmitQuestionPage.jsx'

import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import ManageInfoPage from './pages/admin/ManageInfoPage.jsx'
import ManageAnnouncementsPage from './pages/admin/ManageAnnouncementsPage.jsx'
import UnansweredQueuePage from './pages/admin/UnansweredQueuePage.jsx'
import ChatHistoryReportsPage from './pages/admin/ChatHistoryReportsPage.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FaqPage /></PublicLayout>} />
      <Route path="/announcements" element={<PublicLayout><AnnouncementsPage /></PublicLayout>} />
      <Route
        path="/chat"
        element={
          <PublicLayout>
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/ask"
        element={
          <PublicLayout>
            <ProtectedRoute>
              <SubmitQuestionPage />
            </ProtectedRoute>
          </PublicLayout>
        }
      />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/info"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <ManageInfoPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <ManageAnnouncementsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/unanswered"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <UnansweredQueuePage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <ChatHistoryReportsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <UsersPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
    </Routes>
  )
}
