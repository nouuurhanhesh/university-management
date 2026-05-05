import React, { useState, useEffect } from 'react';
import { getApplications, updateApplicationStatus } from '../utils/storage';

export default function ApplicationList() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const handleStatusChange = (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    
    updateApplicationStatus(id, newStatus);
    setApplications(getApplications());
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Accepted': return 'badge-accepted';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="glass-card">
      <h2>Student Applications</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Review and manage prospective student applications.</p>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>GPA</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>{app.id}</td>
                <td><strong>{app.applicantName}</strong></td>
                <td>{app.email}</td>
                <td>{app.desiredDepartment}</td>
                <td>{app.highSchoolGPA}</td>
                <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <select 
                    className="form-control" 
                    style={{ padding: '0.4rem', width: 'auto' }}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accept</option>
                    <option value="Rejected">Reject</option>
                  </select>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No applications received yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
