import React, { useState, useEffect } from 'react';
import { getCourses } from '../utils/storage';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setCourses(getCourses());
    
    // Load previously selected courses from local storage
    const savedSelected = localStorage.getItem('student_selected_courses');
    if (savedSelected) {
      setSelectedCourses(JSON.parse(savedSelected));
    }
  }, []);

  const handleSelectToggle = (courseId) => {
    let updatedSelected;
    if (selectedCourses.includes(courseId)) {
      updatedSelected = selectedCourses.filter(id => id !== courseId);
    } else {
      updatedSelected = [...selectedCourses, courseId];
    }
    setSelectedCourses(updatedSelected);
  };

  const saveSelection = () => {
    localStorage.setItem('student_selected_courses', JSON.stringify(selectedCourses));
    setSuccess('Course selection saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Get unique departments for the filter dropdown
  const departments = [...new Set(courses.map(c => c.department))];

  const filteredCourses = courses.filter(course => 
    departmentFilter === '' || course.department === departmentFilter
  );

  return (
    <div className="glass-card">
      <h2>Course Catalog</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Browse and select subjects to enroll in.</p>

      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>Filter by Department:</label>
        <select 
          className="form-control" 
          style={{ width: 'auto' }}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        {filteredCourses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No courses available for this department.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      style={{ transform: 'scale(1.2)' }}
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => handleSelectToggle(course.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.department}</td>
                  <td>{course.credits}</td>
                  <td>{course.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button className="btn-primary" onClick={saveSelection}>
        Save Selected Subjects
      </button>
    </div>
  );
}
