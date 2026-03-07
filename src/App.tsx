import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import PageTransition from './components/animations/PageTransition'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import UploadReport from './pages/UploadReport'
import ReportDetail from './pages/ReportDetail'
import DoctorFinder from './pages/DoctorFinder'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
          <Route path="/dashboard" element={
            <ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute><PageTransition><UploadReport /></PageTransition></ProtectedRoute>
          } />
          <Route path="/report/:id" element={
            <ProtectedRoute><PageTransition><ReportDetail /></PageTransition></ProtectedRoute>
          } />
          <Route path="/doctor-finder" element={
            <ProtectedRoute><PageTransition><DoctorFinder /></PageTransition></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
