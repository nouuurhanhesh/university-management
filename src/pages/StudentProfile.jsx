import React, { useState, useEffect } from 'react';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('student_profile_data');
    if (savedData) {
      setProfile(JSON.parse(savedData));
    } else {
      // Default dummy data for the student
      setProfile({
        name: 'John Doe',
        email: 'student@university.edu',
        phone: '01012345678',
        address: '123 University Street, City',
        dateOfBirth: '2000-01-01'
      });
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('student_profile_data', JSON.stringify(profile));
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>My Profile</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>View and edit your personal information.</p>

      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={profile.name} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            name="email" 
            value={profile.email} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phone" 
            value={profile.phone} 
            onChange={handleChange} 
            className="form-control" 
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input 
            type="text" 
            name="address" 
            value={profile.address} 
            onChange={handleChange} 
            className="form-control" 
          />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input 
            type="date" 
            name="dateOfBirth" 
            value={profile.dateOfBirth} 
            onChange={handleChange} 
            className="form-control" 
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
