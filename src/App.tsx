import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { NewNote } from './pages/NewNote'
import { Notes } from './pages/Notes'
import { ViewNote } from './pages/ViewNote'
import { Patients } from './pages/Patients'
import { PatientProfile } from './pages/PatientProfile'
import { Templates } from './pages/Templates'
import { Settings } from './pages/Settings'

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app" replace /> : <Login />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="new-note" element={<NewNote />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/:noteId" element={<ViewNote />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:patientId" element={<PatientProfile />} />
        <Route path="templates" element={<Templates />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/login'} replace />} />
    </Routes>
  )
}
