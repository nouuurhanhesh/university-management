import React, { useState, useEffect } from 'react';
import { getCourses } from '../utils/storage';

export default function StudentMyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const allCourses = getCourses();
    const savedSelected = localStorage.getItem('student_selected_courses');
    
    if (savedSelected) {
      const selectedIds = JSON.parse(savedSelected);
      // Filter the global courses list by the selected IDs
      const filtered = allCourses.filter(course => selectedIds.includes(course.id));
      setEnrolledCourses(filtered);
    }
  }, []);

  // Calculate total credits
  const totalCredits = enrolledCourses.reduce((sum, course) => sum + Number(course.credits || 0), 0);

  return (
    <div className="glass-card">
      <h2>My Enrolled Courses</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>View the courses you have selected for this semester.</p>

      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        {enrolledCourses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't enrolled in any courses yet. Go to the Course Catalog to select subjects.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map(course => (
                <tr key={course.id}>
                  <td style={{ fontWeight: 600 }}>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.department}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className="badge badge-accepted">Enrolled</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Credits:</td>
                <td colSpan="2" style={{ fontWeight: 'bold' }}>{totalCredits}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
