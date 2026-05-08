import React, { useState, useEffect, useRef } from 'react';
import { getProgress, getMessages, saveMessage, getLoggedInUser } from '../utils/storage';

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('progress');
  const [progress, setProgress] = useState({ grades: [], attendance: [] });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const user = getLoggedInUser();
  const chatEndRef = useRef(null);

  // Load progress
  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // Poll for messages to simulate "real-time" and load history
  useEffect(() => {
    const fetchMessages = () => {
      setMessages(getMessages());
    };

    fetchMessages(); // initial load
    const interval = setInterval(fetchMessages, 2000); // poll every 2s
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    saveMessage({
      sender: user.username,
      role: user.role,
      text: newMessage.trim()
    });

    setNewMessage('');
    setMessages(getMessages()); // update immediately
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Parent Portal</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Monitor your child's progress and communicate with teachers.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <button
          className={activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}
          style={activeTab !== 'progress' ? { background: '#f1f5f9', color: '#334155' } : {}}
          onClick={() => setActiveTab('progress')}
        >
          View Progress
        </button>
        <button
          className={activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}
          style={activeTab !== 'chat' ? { background: '#f1f5f9', color: '#334155' } : {}}
          onClick={() => setActiveTab('chat')}
        >
          Chat with Teacher
        </button>
      </div>

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div>
          <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', display: 'inline-block' }}>Academic Grades</h3>
          <div className="table-container" style={{ marginBottom: '2rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {progress.grades.map((g, idx) => (
                  <tr key={idx}>
                    <td>{g.subject}</td>
                    <td style={{ fontWeight: 'bold' }}>{g.grade}</td>
                    <td>{g.remarks}</td>
                  </tr>
                ))}
                {progress.grades.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No grades recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', display: 'inline-block' }}>Attendance Record</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {progress.attendance.map((a, idx) => (
                  <tr key={idx}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${a.status === 'Present' ? 'badge-accepted' : 'badge-rejected'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {progress.attendance.length === 0 && (
                  <tr><td colSpan="2" style={{ textAlign: 'center' }}>No attendance records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '500px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>

          <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <strong>Teacher / Administration Chat</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time secure messaging</div>
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#ffffff' }}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>No messages yet. Send a message to start communicating.</div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender === user.username;
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                      {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: isMe ? 'var(--primary-color)' : '#f1f5f9',
                      color: isMe ? '#100f0fff' : '#334155',
                      borderBottomRightRadius: isMe ? '0' : '12px',
                      borderBottomLeftRadius: isMe ? '12px' : '0'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, marginRight: '1rem', marginBottom: 0 }}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
