import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, loginUser } from '../utils/storage';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    
    // Find matching user
    const matchedUserKey = Object.keys(users).find(
      key => users[key].username === username && users[key].password === password
    );

    if (matchedUserKey) {
      const user = users[matchedUserKey];
      loginUser({ username: user.username, role: user.role });
      
      if (user.role === 'Facility Coordinator') {
        navigate('/reservations');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="centered-card-wrapper">
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
