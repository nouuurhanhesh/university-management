// FAO-01: Create Student Record
import React, { useState } from 'react';
import { saveStudent, generateStudentId } from '../utils/storage';

export default function CreateStudent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    level: '',
    phone: ''
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return Object.values(formData).every(val => val.trim() !== '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (!isFormValid()) {
      setMessage({ type: 'danger', text: 'All fields are required.' });
      return;
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      setMessage({ type: 'danger', text: 'Invalid email format.' });
      return;
    }

    if (!/^(010|011|012|015)\d{8}$/.test(formData.phone)) {
      setMessage({ type: 'danger', text: 'Invalid phone number format. Use Egyptian format (e.g., 01012345678).' });
      return;
    }

    const newStudent = {
      ...formData,
      id: generateStudentId(),
      createdAt: new Date().toISOString()
    };

    saveStudent(newStudent);
    setMessage({ type: 'success', text: `Student ${newStudent.name} created successfully with ID ${newStudent.id}` });
    setFormData({ name: '', email: '', department: '', level: '', phone: '' });
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Create New Student</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Fill in the form to register a new student to the system.</p>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Level/Year</label>
            <input type="text" name="level" value={formData.level} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="01012345678" />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
          Create Student
        </button>
      </form>
    </div>
  );
}
