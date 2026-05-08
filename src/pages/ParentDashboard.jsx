import { useEffect, useMemo, useRef, useState } from "react";
import {
  appendConversationMessage,
  buildConversationId,
  getLoggedInUser,
  getParentLinkedStudentId,
  getProfessorAccounts,
  getProgressForStudent,
  getStudentById,
  markConversationSeen,
} from "../utils/storage";
import { useConversationMessages } from "../hooks/useConversationMessages";

export default function ParentDashboard() {
  const user = getLoggedInUser();
  const [activeTab, setActiveTab] = useState("progress");

  const childId = user?.username ? getParentLinkedStudentId(user.username) : null;
  const child = childId ? getStudentById(childId) : null;
  const progress = childId ? getProgressForStudent(childId) : { grades: [], attendance: [] };

  const professors = useMemo(() => getProfessorAccounts(), []);
  const [selectedProfessor, setSelectedProfessor] = useState("");

  const professorUsername =
    selectedProfessor && professors.some((p) => p.username === selectedProfessor)
      ? selectedProfessor
      : professors[0]?.username || "";

  const conversationId =
    user?.username && professorUsername && childId
      ? buildConversationId(user.username, professorUsername, childId)
      : null;

  const { messages } = useConversationMessages(
    user?.username,
    user?.role,
    conversationId,
  );

  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const prevLastMsgIdRef = useRef(null);

  useEffect(() => {
    prevLastMsgIdRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (!messages.length || !conversationId || !user?.username) return;
    const last = messages[messages.length - 1];
    const isViewingChat =
      activeTab === "chat" &&
      !!professorUsername &&
      typeof document !== "undefined" &&
      document.visibilityState === "visible";

    if (isViewingChat && last.fromUsername !== user.username) {
      markConversationSeen(user.username, conversationId, last.timestamp);
    }

    const prevId = prevLastMsgIdRef.current;
    if (prevId === null) {
      prevLastMsgIdRef.current = last.id;
      return;
    }
    if (last.id === prevId) return;
    prevLastMsgIdRef.current = last.id;

    if (last.fromUsername === user.username) return;
    if (isViewingChat) return;
    if (typeof document !== "undefined" && !document.hidden) return;

    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(`New message from ${last.fromUsername}`, {
          body: last.body.slice(0, 160),
        });
      }
    } catch {
      // ignore
    }
  }, [messages, conversationId, user?.username, activeTab, professorUsername]);

  const requestNotifications = () => {
    if (typeof Notification === "undefined" || !Notification.requestPermission) return;
    Notification.requestPermission();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !childId || !user?.username) return;

    appendConversationMessage({
      conversationId,
      studentId: childId,
      fromUsername: user.username,
      fromRole: "Parent",
      body: newMessage.trim(),
    });
    setNewMessage("");
  };

  const attendanceBadge = (status) => {
    if (status === "Present") return "badge-accepted";
    if (status === "Absent") return "badge-rejected";
    return "badge-pending";
  };

  return (
    <div className="glass-card parent-portal">
      <div className="parent-portal-header">
        <div>
          <h2 style={{ marginBottom: "0.35rem" }}>Parent Portal</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            View your child’s progress (read-only) and message their teachers in real time.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={requestNotifications}>
          Enable message alerts
        </button>
      </div>

      <div className="parent-tabs">
        <button
          type="button"
          className={activeTab === "progress" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("progress")}
        >
          Child progress
        </button>
        <button
          type="button"
          className={activeTab === "chat" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("chat")}
        >
          Chat with teacher
        </button>
      </div>

      {activeTab === "progress" && (
        <div className="parent-progress">
          <div className="read-only-banner" role="status">
            Read-only: grades and attendance cannot be edited here (CPT-01).
          </div>

          <div className="child-summary">
            <h3>Student</h3>
            {child ? (
              <p>
                <strong>{child.name}</strong> · {child.id} · {child.department} · {child.level}
              </p>
            ) : (
              <p className="text-muted">No student is linked to this parent account. Contact the registrar.</p>
            )}
          </div>

          <h3 className="section-title">Grades</h3>
          <div className="table-container" style={{ marginBottom: "2rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Course / subject</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {progress.grades.map((g, idx) => (
                  <tr key={`${g.subject}-${idx}`}>
                    <td>{g.subject}</td>
                    <td style={{ fontWeight: 700 }}>{g.grade}</td>
                    <td>{g.remarks}</td>
                  </tr>
                ))}
                {progress.grades.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "2rem" }}>
                      No grades on file for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="section-title">Attendance</h3>
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
                  <tr key={`${a.date}-${idx}`}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${attendanceBadge(a.status)}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
                {progress.attendance.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center", padding: "2rem" }}>
                      No attendance records for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="parent-messaging">
          <p className="text-muted" style={{ marginBottom: "1rem" }}>
            Messages are stored, scoped to you and the selected professor, and sync in real time across open windows
            (CPT-02, CPT-05).
          </p>

          <div className="form-group" style={{ maxWidth: "320px" }}>
            <label>Teacher (professor account)</label>
            <select
              className="form-control"
              value={professorUsername}
              onChange={(e) => setSelectedProfessor(e.target.value)}
            >
              {professors.length === 0 && <option value="">No professors in system</option>}
              {professors.map((p) => (
                <option key={p.username} value={p.username}>
                  {p.username}
                </option>
              ))}
            </select>
          </div>

          <div className="chat-panel">
            <div className="chat-panel-header">
              <div>
                <strong>Conversation</strong>
                <div className="chat-panel-sub">
                  {child ? `${child.name} (${child.id})` : "Student"} · Professor: {professorUsername || "—"}
                </div>
              </div>
              <span className="delivered-pill">End-to-end stored · delivered when saved</span>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">No messages yet. Say hello to start the thread.</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.fromUsername === user?.username;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble-row ${isMe ? "me" : "them"}`}
                    >
                      <div className="chat-meta">
                        {msg.fromUsername} · {msg.fromRole} ·{" "}
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                      <div className={`chat-bubble ${isMe ? "me" : "them"}`}>
                        {msg.body}
                        {isMe && msg.delivered && (
                          <span className="delivered-mark" title="Stored and delivered">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-composer" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control"
                placeholder="Write a message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!conversationId || !professors.length}
              />
              <button type="submit" className="btn-primary" disabled={!conversationId || !professors.length}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
