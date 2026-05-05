// FAO-02: Update Student Record
import React, { useState, useEffect } from 'react';
import { getStudents, updateStudent } from '../utils/storage';
import { useLocation } from 'react-router-dom';

export default function UpdateStudent() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    const allStudents = getStudents();
    setStudents(allStudents);
    setFilteredStudents(allStudents);
    
    // Check if we came from StudentList with a pre-selected student
    if (location.state && location.state.studentId) {
      const studentToEdit = allStudents.find(s => s.id === location.state.studentId);
      if (studentToEdit) {
        handleSelectStudent(studentToEdit);
      }
    }

    const logs = JSON.parse(localStorage.getItem('auditLog')) || [];
    setAuditLog(logs);
  }, [location]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setFormData(student);
    setMessage(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine what changed
    let changes = [];
    for (const key in formData) {
      if (formData[key] !== selectedStudent[key]) {
        changes.push(`Changed ${key} from "${selectedStudent[key]}" to "${formData[key]}"`);
      }
    }

    if (changes.length === 0) {
      setMessage({ type: 'warning', text: 'No changes detected.' });
      return;
    }

    const changesDescription = changes.join(', ');
    updateStudent(formData, changesDescription);
    
    // Refresh data
    const updatedStudents = getStudents();
    setStudents(updatedStudents);
    handleSearch({ target: { value: searchTerm } }); // update filtered list
    setSelectedStudent(formData);
    
    const logs = JSON.parse(localStorage.getItem('auditLog')) || [];
    setAuditLog(logs);

    setMessage({ type: 'success', text: 'Student updated successfully!' });
  };

  const studentLogs = selectedStudent ? auditLog.filter(log => log.studentId === selectedStudent.id) : [];

  return (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>Update Student Record</h2>
      
      {!selectedStudent ? (
        <>
          <div className="search-bar">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID or Name..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 1rem', width: 'auto' }}
                        onClick={() => handleSelectStudent(student)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <button 
            className="logout-btn" 
            style={{ marginBottom: '1.5rem' }} 
            onClick={() => setSelectedStudent(null)}
          >
            ← Back to Search
          </button>

          {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <h3>Editing: {selectedStudent.name} ({selectedStudent.id})</h3>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Level</label>
                <input type="text" name="level" value={formData.level} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>

            <div>
              <h3>Audit Trail</h3>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '10px', height: '100%', maxHeight: '400px', overflowY: 'auto' }}>
                {studentLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No changes recorded yet.</p>
                ) : (
                  studentLogs.slice().reverse().map((log, index) => (
                    <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                        {new Date(log.changedAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.9rem' }}>{log.changes}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
