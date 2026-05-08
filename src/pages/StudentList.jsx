import React, { useState, useEffect } from 'react';
import { getStudents } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Enrolled Students</h2>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/students/create')}
        >
          Add New Student
        </button>
      </div>
      <div className="search-bar">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by name, ID, or department..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Level</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td><strong>{student.name}</strong></td>
                <td>{student.email}</td>
                <td>{student.department}</td>
                <td>{student.level}</td>
                <td>{student.phone}</td>
                <td>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => navigate('/students/update', { state: { studentId: student.id } })}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
