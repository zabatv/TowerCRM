import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Branches } from './pages/Branches';
import { Employees } from './pages/Employees';
import { Leads } from './pages/Leads';
import { Groups } from './pages/Groups';
import { Lessons } from './pages/Lessons';
import { Students } from './pages/Students';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><SocketProvider><Layout /></SocketProvider></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/branches" element={<ProtectedRoute roles={['admin', 'manager']}><Branches /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute roles={['admin', 'manager']}><Employees /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute roles={['admin', 'manager', 'sales']}><Leads /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute roles={['admin', 'manager', 'teacher']}><Groups /></ProtectedRoute>} />
            <Route path="/lessons" element={<ProtectedRoute roles={['admin', 'manager', 'teacher']}><Lessons /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute roles={['admin', 'manager', 'teacher']}><Students /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['admin', 'manager']}><Reports /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
