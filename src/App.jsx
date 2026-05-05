import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { initStorage, isUserLoggedIn, logoutUser, getLoggedInUser } from './utils/storage';

// Pages
import ApplyOnline from './pages/ApplyOnline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateStudent from './pages/CreateStudent';
import UpdateStudent from './pages/UpdateStudent';
import StudentList from './pages/StudentList';
import ApplicationList from './pages/ApplicationList';
import RoomReservation from './pages/RoomReservation';
import Courses from './pages/Courses';
import Staff from './pages/Staff';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isUserLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const user = getLoggedInUser();
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, send them to their specific default page
    if (user.role === 'Facility Coordinator') return <Navigate to="/reservations" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link to={user.role === 'Facility Coordinator' ? '/reservations' : '/dashboard'} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1.2rem' }}>
            UniManage
          </Link>
        </div>
        <div className="nav-links">
          {user.role === 'Administrator' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/students/list">Students</Link>
              <Link to="/applications">Applications</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/staff">Staff</Link>
            </>
          )}
          {user.role === 'Facility Coordinator' && (
            <Link to="/reservations">Reservations</Link>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{user.username} ({user.role})</span>
          <button 
            className="logout-btn" 
            onClick={() => {
              logoutUser();
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      {children}
    </>
  );
};

function App() {
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Route (FAO-05) */}
          <Route path="/" element={<ApplyOnline />} />
          
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Administrator']}><Dashboard /></ProtectedRoute>} />
          <Route path="/students/create" element={<ProtectedRoute allowedRoles={['Administrator']}><CreateStudent /></ProtectedRoute>} />
          <Route path="/students/update" element={<ProtectedRoute allowedRoles={['Administrator']}><UpdateStudent /></ProtectedRoute>} />
          <Route path="/students/list" element={<ProtectedRoute allowedRoles={['Administrator']}><StudentList /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['Administrator']}><ApplicationList /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute allowedRoles={['Administrator']}><Courses /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['Administrator']}><Staff /></ProtectedRoute>} />
          
          <Route path="/reservations" element={<ProtectedRoute allowedRoles={['Facility Coordinator', 'Administrator']}><RoomReservation /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
