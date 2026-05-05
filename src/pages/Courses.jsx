import React, { useState, useEffect } from 'react';
import { getCourses, saveCourse } from '../utils/storage';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: '',
    department: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!form.code.trim() || !form.name.trim() || !form.credits || !form.department.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isNaN(form.credits) || Number(form.credits) <= 0) {
      setError('Credits must be a positive number.');
      return;
    }

    // Check for duplicate course code
    if (courses.some(c => c.code.toUpperCase() === form.code.toUpperCase().trim())) {
      setError('Course code already exists.');
      return;
    }

    const newCourse = {
      ...form,
      id: Date.now().toString(),
      code: form.code.toUpperCase().trim(),
    };

    saveCourse(newCourse);
    setCourses(getCourses());
    setSuccess('Course successfully created.');
    setForm({ code: '', name: '', credits: '', department: '', description: '' });
  };

  return (
    <div className="glass-card">
      <h2>Curriculum Management</h2>
      <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Define and manage university courses.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Course Code *</label>
            <input 
              type="text" 
              name="code"
              className="form-control" 
              placeholder="e.g. CS101"
              value={form.code}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Course Name *</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              placeholder="Introduction to Computer Science"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Credits *</label>
            <input 
              type="number" 
              name="credits"
              className="form-control" 
              min="1"
              value={form.credits}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Department *</label>
          <select name="department" className="form-control" value={form.department} onChange={handleChange}>
            <option value="">-- Select Department --</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Business Administration">Business Administration</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            name="description"
            className="form-control" 
            rows="3"
            value={form.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="btn-primary">
          Create Course
        </button>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />

      <h3>Existing Courses</h3>
      <div className="table-container">
        {courses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No courses found. Create one above.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Dept</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td style={{ fontWeight: 600 }}>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.department}</td>
                  <td>{course.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
