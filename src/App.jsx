import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, NavLink } from 'react-router-dom';
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
import StudentCourses from './pages/StudentCourses';
import StudentMyCourses from './pages/StudentMyCourses';
import StudentProfile from './pages/StudentProfile';
import ParentDashboard from './pages/ParentDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isUserLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const user = getLoggedInUser();
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, send them to their specific default page
    if (user.role === 'Facility Coordinator') return <Navigate to="/reservations" replace />;
    if (user.role === 'Student') return <Navigate to="/student/courses" replace />;
    if (user.role === 'Parent') return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link to={user.role === 'Facility Coordinator' ? '/reservations' : user.role === 'Student' ? '/student/courses' : user.role === 'Parent' ? '/parent/dashboard' : '/dashboard'} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1.2rem' }}>
            UniManage
          </Link>
        </div>
        <div className="nav-links">
          {user.role === 'Administrator' && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/students/list">Students</NavLink>
              <NavLink to="/applications">Applications</NavLink>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/staff">Staff</NavLink>
            </>
          )}
          {user.role === 'Facility Coordinator' && (
            <NavLink to="/reservations">Reservations</NavLink>
          )}
          {user.role === 'Student' && (
            <>
              <NavLink to="/student/courses">Course Catalog</NavLink>
              <NavLink to="/student/my-courses">My Courses</NavLink>
              <NavLink to="/student/profile">My Profile</NavLink>
            </>
          )}
          {user.role === 'Parent' && (
            <NavLink to="/parent/dashboard">Parent Portal</NavLink>
          )}
        </div>
        <div className="nav-user-section">
          <span className="user-chip">{user.username} ({user.role})</span>
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

          {/* Student Routes */}
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['Student']}><StudentCourses /></ProtectedRoute>} />
          <Route path="/student/my-courses" element={<ProtectedRoute allowedRoles={['Student']}><StudentMyCourses /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['Student']}><StudentProfile /></ProtectedRoute>} />

          {/* Parent Route */}
          <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['Parent']}><ParentDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
