// FAO-05: Apply Online
import React, { useState } from 'react';
import { saveApplication, generateApplicationId } from '../utils/storage';

export default function ApplyOnline() {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    desiredDepartment: '',
    highSchoolGPA: ''
  });
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return Object.values(formData).every(val => val.trim() !== '');
  };

  const handleSubmit = (e) => {
    e.submitter?.blur(); // prevent focus ring
    e.preventDefault();
    
    // Validate all fields
    if (!isFormValid()) {
      setMessage({ type: 'danger', text: 'Please fill out all fields.' });
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

    const gpa = parseFloat(formData.highSchoolGPA);
    if (isNaN(gpa) || gpa < 0 || gpa > 100) {
      setMessage({ type: 'danger', text: 'GPA must be between 0 and 100.' });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate slight delay for UX
    setTimeout(() => {
      const newApp = {
        ...formData,
        id: generateApplicationId(),
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };

      saveApplication(newApp);
      setMessage({ type: 'success', text: `Application submitted successfully! Your application ID is ${newApp.id}` });
      setFormData({ applicantName: '', email: '', phone: '', desiredDepartment: '', highSchoolGPA: '' });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="centered-card-wrapper">
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%' }}>
        <h2>University Online Application</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Apply online to join our prestigious university.</p>
        
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="01012345678" />
          </div>
          <div className="form-group">
            <label>Desired Department</label>
            <select name="desiredDepartment" value={formData.desiredDepartment} onChange={handleChange} className="form-control">
              <option value="">Select a Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Medicine">Medicine</option>
            </select>
          </div>
          <div className="form-group">
            <label>High School GPA (%)</label>
            <input type="number" step="0.01" name="highSchoolGPA" value={formData.highSchoolGPA} onChange={handleChange} className="form-control" placeholder="95.5" />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>Login</a>
        </div>
      </div>
    </div>
  );
}
