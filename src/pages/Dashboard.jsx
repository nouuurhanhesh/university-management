import React, { useEffect, useState } from 'react';
import { getStudents, getApplications } from '../utils/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, applications: 0 });

  useEffect(() => {
    const students = getStudents();
    const applications = getApplications();
    setStats({
      students: students.length,
      applications: applications.length
    });
  }, []);

  return (
    <div className="glass-card">
      <h1>Admin Dashboard</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
        Welcome back, Administrator. Here's the overview of the university management system.
      </p>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <h3>Total Enrolled Students</h3>
          <div className="value">{stats.students}</div>
        </div>
        <div className="glass-card stat-card">
          <h3>Total Applications</h3>
          <div className="value">{stats.applications}</div>
        </div>
      </div>
    </div>
  );
}
