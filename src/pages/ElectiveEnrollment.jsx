import React, { useEffect, useState } from 'react';
import { getCourses } from '../utils/storage';

export default function ElectiveEnrollment() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);

  const studentId = 'STUDENT_1'; // temporary until auth is added

  useEffect(() => {
    setCourses(getCourses());

    const stored = JSON.parse(localStorage.getItem('enrollments')) || {};
    setSelected(stored[studentId] || []);
  }, []);

  const toggleCourse = (courseId) => {
    if (selected.includes(courseId)) {
      setSelected(selected.filter(id => id !== courseId));
    } else {
      setSelected([...selected, courseId]);
    }
  };

  const saveEnrollment = () => {
    const stored = JSON.parse(localStorage.getItem('enrollments')) || {};

    stored[studentId] = selected;

    localStorage.setItem('enrollments', JSON.stringify(stored));

    alert('Enrollment saved successfully!');
  };

  return (
    <div className="glass-card">
      <h2>Elective Enrollment</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Select courses you want to enroll in.
      </p>

      <div style={{ marginTop: '1rem' }}>
        {courses.map(course => (
          <div key={course.id} style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(course.id)}
                onChange={() => toggleCourse(course.id)}
                style={{ marginRight: '0.5rem' }}
              />
              {course.code} - {course.name}
            </label>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={saveEnrollment}>
        Save Enrollment
      </button>
    </div>
  );
}