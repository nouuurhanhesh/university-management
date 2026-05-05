import React, { useState, useEffect } from 'react';
import { getStaff, saveStaff } from '../utils/storage';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setStaffList(getStaff());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) {
      setError('Name, Role, and Email are required fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      setError('Please provide a valid email address.');
      return;
    }

    const newStaff = {
      ...form,
      id: Date.now().toString(),
    };

    saveStaff(newStaff);
    setStaffList(getStaff());
    setSuccess('Staff profile successfully created.');
    setForm({ name: '', role: '', email: '', phone: '', department: '' });
  };

  return (
    <div className="glass-card">
      <h2>Staff Directory</h2>
      <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Centralized management for university staff profiles.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              placeholder="e.g. Dr. Alice Smith"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Role / Position *</label>
            <input 
              type="text" 
              name="role"
              className="form-control" 
              placeholder="e.g. Professor"
              value={form.role}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Email Address *</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              placeholder="alice.smith@university.edu"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              className="form-control" 
              placeholder="+1 (555) 123-4567"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Department</label>
          <select name="department" className="form-control" value={form.department} onChange={handleChange}>
            <option value="">-- Select Department --</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Facilities">Facilities</option>
            <option value="Administration">Administration</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Add Staff Profile
        </button>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />

      <h3>Staff Profiles</h3>
      <div className="table-container">
        {staffList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No staff profiles found. Add one above.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr key={staff.id}>
                  <td style={{ fontWeight: 600 }}>{staff.name}</td>
                  <td>{staff.role}</td>
                  <td>{staff.department || '-'}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{staff.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{staff.phone}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
