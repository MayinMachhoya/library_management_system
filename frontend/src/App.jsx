import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import AdminBooks from './pages/admin/AdminBooks';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCirculation from './pages/admin/AdminCirculation';
import StudentDashboard from './pages/student/StudentDashboard';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/books' : '/student/issues'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="books" element={<AdminBooks />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="circulation" element={<AdminCirculation />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<PrivateRoute allowedRoles={['student']} />}>
              <Route path="issues" element={<StudentDashboard />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
