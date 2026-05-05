import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Seed Admin User
if (!localStorage.getItem('adminUser')) {
  localStorage.setItem('adminUser', JSON.stringify({
    username: 'admin',
    password: 'admin123'
  }));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
