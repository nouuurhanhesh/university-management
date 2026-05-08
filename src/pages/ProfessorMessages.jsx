import { useEffect, useRef, useState } from "react";
import {
  MESSAGE_BROADCAST_CHANNEL,
  appendConversationMessage,
  getLoggedInUser,
  getMessagesForConversation,
  getStudentById,
  listConversationIdsForParticipant,
  markConversationSeen,
  parseConversationId,
} from "../utils/storage";
import { useConversationMessages } from "../hooks/useConversationMessages";

export default function ProfessorMessages() {
  const user = getLoggedInUser();

  const [threadId, setThreadId] = useState("");
  const [inboxVersion, setInboxVersion] = useState(0);

  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel(MESSAGE_BROADCAST_CHANNEL);
      bc.onmessage = () => setInboxVersion((v) => v + 1);
    } catch {
      bc = null;
    }

    const onStorage = (e) => {
      if (e.key === "messages") setInboxVersion((v) => v + 1);
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => setInboxVersion((v) => v + 1), 3000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  void inboxVersion;

  const conversationIds =
    user?.username && user.role === "Professor"
      ? listConversationIdsForParticipant(user.username, user.role)
      : [];

  const sortedConversations =
    !user?.username
      ? []
      : conversationIds
          .map((id) => {
            const msgs = getMessagesForConversation(id, user.username, user.role);
            const last = msgs[msgs.length - 1];
            return { id, last };
          })
          .sort((a, b) => {
            const ta = a.last ? new Date(a.last.timestamp).getTime() : 0;
            const tb = b.last ? new Date(b.last.timestamp).getTime() : 0;
            return tb - ta;
          });

  const activeThreadId =
    threadId &&
    sortedConversations.some((c) => c.id === threadId)
      ? threadId
      : sortedConversations[0]?.id || "";

  const { messages } = useConversationMessages(
    user?.username,
    user?.role,
    activeThreadId || null,
  );

  const [reply, setReply] = useState("");
  const chatEndRef = useRef(null);
  const prevLastMsgIdRef = useRef(null);

  useEffect(() => {
    prevLastMsgIdRef.current = null;
  }, [activeThreadId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeThreadId]);

  useEffect(() => {
    if (!messages.length || !activeThreadId || !user?.username) return;
    const last = messages[messages.length - 1];

    const isForeground =
      typeof document !== "undefined" && document.visibilityState === "visible";

    if (isForeground && last.fromUsername !== user.username) {
      markConversationSeen(user.username, activeThreadId, last.timestamp);
    }

    const prevId = prevLastMsgIdRef.current;
    if (prevId === null) {
      prevLastMsgIdRef.current = last.id;
      return;
    }
    if (last.id === prevId) return;
    prevLastMsgIdRef.current = last.id;

    if (last.fromUsername === user.username) return;
    if (isForeground) return;

    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const meta = parseConversationId(activeThreadId);
        new Notification(`New message from parent ${meta?.parentUsername || ""}`, {
          body: last.body.slice(0, 160),
        });
      }
    } catch {
      // ignore
    }
  }, [messages, activeThreadId, user?.username]);

  const requestNotifications = () => {
    if (typeof Notification === "undefined" || !Notification.requestPermission) return;
    Notification.requestPermission();
  };

  const selectedMeta = parseConversationId(activeThreadId);
  const linkedStudent =
    selectedMeta?.studentId && getStudentById(selectedMeta.studentId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeThreadId || !selectedMeta?.studentId || !user?.username)
      return;

    appendConversationMessage({
      conversationId: activeThreadId,
      studentId: selectedMeta.studentId,
      fromUsername: user.username,
      fromRole: "Professor",
      body: reply.trim(),
    });
    setReply("");
  };

  return (
    <div className="glass-card professor-inbox">
      <div className="professor-inbox-header">
        <div>
          <h2 style={{ marginBottom: "0.35rem" }}>Professor inbox</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Real-time parent messaging with history, restricted to assigned conversations (CPT-05).
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={requestNotifications}>
          Enable message alerts
        </button>
      </div>

      <div className="professor-inbox-grid">
        <aside className="professor-thread-list">
          <h3>Conversations</h3>
          {sortedConversations.length === 0 ? (
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              No threads yet. When a parent sends a message, it will appear here.
            </p>
          ) : (
            <ul>
              {sortedConversations.map(({ id, last }) => {
                const meta = parseConversationId(id);
                const stu = meta?.studentId ? getStudentById(meta.studentId) : null;
                const active = id === activeThreadId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`thread-item ${active ? "active" : ""}`}
                      onClick={() => setThreadId(id)}
                    >
                      <div className="thread-title">{meta?.parentUsername}</div>
                      <div className="thread-sub">
                        {stu ? `${stu.name} · ${stu.id}` : meta?.studentId}
                      </div>
                      {last && (
                        <div className="thread-preview">{last.body.slice(0, 72)}</div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="professor-thread-main">
          {!activeThreadId ? (
            <div className="chat-empty">Select a conversation</div>
          ) : (
            <>
              <div className="chat-panel-header">
                <div>
                  <strong>Thread</strong>
                  <div className="chat-panel-sub">
                    Parent: {selectedMeta?.parentUsername} · Student:{" "}
                    {linkedStudent ? `${linkedStudent.name} (${linkedStudent.id})` : selectedMeta?.studentId}
                  </div>
                </div>
                <span className="delivered-pill">Authorized participants only</span>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="chat-empty">No messages in this thread.</div>
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

              <form className="chat-composer" onSubmit={handleSend}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Reply to parent…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  Send reply
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
