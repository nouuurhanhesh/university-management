import React, { useEffect, useState } from 'react';
import { getCourses } from '../utils/storage';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  return (
    <div className="glass-card">
      <h2>Course Catalog</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Browse available courses for enrollment.
      </p>

      <div className="table-container">
        {courses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            No courses available.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
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
    </div>
  );
}