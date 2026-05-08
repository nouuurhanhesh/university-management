export const MESSAGE_BROADCAST_CHANNEL = "unimanage-messages-v1";

const KEYS = {
  STUDENTS: "students",
  APPLICATIONS: "applications",
  COURSES: "courses",
  STAFF: "staff",
  AUDIT: "auditLog",
  USERS: "systemUsers",
  AUTH: "loggedInUser",
  MESSAGES: "messages",
  PROGRESS: "progress",
  PARENT_LINKS: "parentChildLinks",
  MESSAGE_LAST_SEEN: "messageLastSeen",
};

const safeParse = (key, defaultValue) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const migrateLegacyProgress = () => {
  const links = safeParse(KEYS.PARENT_LINKS, {});
  const fallbackStudent =
    links.parent ||
    (getStudents()[0] && getStudents()[0].id) ||
    "STU-001";
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.byStudentId && typeof parsed.byStudentId === "object") return;
    if (parsed && (parsed.grades || parsed.attendance)) {
      setItem(KEYS.PROGRESS, {
        byStudentId: {
          [fallbackStudent]: {
            grades: parsed.grades || [],
            attendance: parsed.attendance || [],
          },
        },
      });
    }
  } catch {
    // ignore
  }
};

const migrateLegacyMessages = () => {
  let messages = safeParse(KEYS.MESSAGES, []);
  if (!Array.isArray(messages) || messages.length === 0) return;
  const looksLegacy = messages.some(
    (m) =>
      (typeof m.text === "string" && typeof m.body !== "string") ||
      (!m.conversationId && typeof m.sender === "string"),
  );
  if (!looksLegacy) return;
  const links = safeParse(KEYS.PARENT_LINKS, {});
  const demoProf = Object.values(getUsers()).find((u) => u.role === "Professor");
  const professorUsername = demoProf?.username || "professor";
  const studentId = links.parent || (getStudents()[0] && getStudents()[0].id) || "STU-001";
  const convId = buildConversationId("parent", professorUsername, studentId);
  messages = messages.map((m) => {
    if (m.body !== undefined && m.conversationId) return m;
    return {
      id: m.id || String(Date.now() + Math.random()),
      conversationId: convId,
      studentId,
      fromUsername: m.sender || "parent",
      fromRole: m.role === "Professor" ? "Professor" : "Parent",
      body: (m.body || m.text || "").toString(),
      timestamp: m.timestamp || new Date().toISOString(),
      delivered: true,
    };
  });
  setItem(KEYS.MESSAGES, messages);
};

export const broadcastMessagesUpdated = () => {
  try {
    const bc = new BroadcastChannel(MESSAGE_BROADCAST_CHANNEL);
    bc.postMessage({ type: "messages-updated", t: Date.now() });
    bc.close();
  } catch {
    // ignore unsupported env
  }
};

/** Subscribe to local message store changes + cross-tab BroadcastChannel (+ light polling). */
export const subscribeToMessageUpdates = (onUpdate) => {
  const notify = () => {
    queueMicrotask(() => onUpdate());
  };
  notify();

  let bc = null;
  try {
    bc = new BroadcastChannel(MESSAGE_BROADCAST_CHANNEL);
    bc.onmessage = () => notify();
  } catch {
    bc = null;
  }

  const onStorage = (e) => {
    if (e.key === "messages") notify();
  };
  window.addEventListener("storage", onStorage);

  const intervalId = window.setInterval(notify, 2500);

  return () => {
    if (bc) bc.close();
    window.removeEventListener("storage", onStorage);
    window.clearInterval(intervalId);
  };
};

export const initStorage = () => {
  let users = safeParse(KEYS.USERS, null);
  if (!users) {
    users = {
      admin: { username: "admin", password: "admin123", role: "Administrator" },
      facility: { username: "facility", password: "facility123", role: "Facility Coordinator" },
      parent: { username: "parent", password: "parent123", role: "Parent" },
      professor: { username: "professor", password: "professor123", role: "Professor" },
    };
  }

  if (!users.student) {
    users.student = { username: "student", password: "student123", role: "Student" };
  }
  if (!users.parent) {
    users.parent = { username: "parent", password: "parent123", role: "Parent" };
  }
  if (!users.professor && !Object.values(users).some((u) => u.role === "Professor")) {
    users.professor = { username: "professor", password: "professor123", role: "Professor" };
  }

  setItem(KEYS.USERS, users);

  if (!localStorage.getItem(KEYS.STUDENTS)) setItem(KEYS.STUDENTS, []);

  let students = safeParse(KEYS.STUDENTS, []);
  const needsDemoStudent = students.length === 0;
  if (needsDemoStudent) {
    const demoStudent = {
      id: "STU-001",
      name: "Jordan Lee",
      email: "jordan.lee@university.edu",
      department: "Computer Science",
      level: "Year 2",
      phone: "01012345678",
      createdAt: new Date().toISOString(),
    };
    students = [demoStudent];
    setItem(KEYS.STUDENTS, students);
  }

  if (!localStorage.getItem(KEYS.PARENT_LINKS)) {
    const firstStudentId =
      (students[0] && students[0].id) ||
      safeParse(KEYS.STUDENTS, [{}])[0]?.id ||
      "STU-001";
    setItem(KEYS.PARENT_LINKS, { parent: firstStudentId });
  }

  if (!localStorage.getItem(KEYS.APPLICATIONS)) setItem(KEYS.APPLICATIONS, []);
  if (!localStorage.getItem(KEYS.COURSES)) {
    setItem(KEYS.COURSES, [
      { id: "1", code: "CS101", name: "Introduction to Computer Science", credits: 3, department: "Computer Science", description: "Basic concepts of programming." },
      { id: "2", code: "ENG201", name: "Engineering Mechanics", credits: 4, department: "Engineering", description: "Statics and dynamics." },
      { id: "3", code: "MATH101", name: "Calculus I", credits: 4, department: "Mathematics", description: "Limits, derivatives, integrals." },
      { id: "4", code: "BUS101", name: "Introduction to Business", credits: 3, department: "Business Administration", description: "Business concepts." }
    ]);
  }
  if (!localStorage.getItem(KEYS.STAFF)) setItem(KEYS.STAFF, []);
  if (!localStorage.getItem(KEYS.AUDIT)) setItem(KEYS.AUDIT, []);
  if (!localStorage.getItem(KEYS.MESSAGES)) setItem(KEYS.MESSAGES, []);

  migrateLegacyProgress();

  if (!localStorage.getItem(KEYS.PROGRESS)) {
    const link = safeParse(KEYS.PARENT_LINKS, {});
    const sid = link.parent || (students[0] && students[0].id) || "STU-001";
    setItem(KEYS.PROGRESS, {
      byStudentId: {
        [sid]: {
          grades: [
            { subject: "CS101 Programming", grade: "A-", remarks: "Strong assignments" },
            { subject: "MATH201 Calculus", grade: "B+", remarks: "Improving steadily" },
            { subject: "ENG105 Writing", grade: "A", remarks: "Excellent essays" },
          ],
          attendance: [
            { date: "2026-04-02", status: "Present" },
            { date: "2026-04-03", status: "Present" },
            { date: "2026-04-07", status: "Late" },
            { date: "2026-04-09", status: "Absent" },
          ],
        },
      },
    });
  }

  if (!localStorage.getItem(KEYS.MESSAGE_LAST_SEEN))
    setItem(KEYS.MESSAGE_LAST_SEEN, {});

  migrateLegacyMessages();
};

export const getUsers = () => safeParse(KEYS.USERS, {});

export const loginUser = (user) => setItem(KEYS.AUTH, user);

export const logoutUser = () => localStorage.removeItem(KEYS.AUTH);

export const getLoggedInUser = () => safeParse(KEYS.AUTH, null);

export const isUserLoggedIn = () => getLoggedInUser() !== null;

// --- Courses ---

export const getCourses = () => safeParse(KEYS.COURSES, []);

export const saveCourse = (course) => {
  const courses = getCourses();
  courses.push(course);
  setItem(KEYS.COURSES, courses);
};

// --- Staff ---

export const getStaff = () => safeParse(KEYS.STAFF, []);

export const saveStaff = (staffMember) => {
  const staff = getStaff();
  staff.push(staffMember);
  setItem(KEYS.STAFF, staff);
};

// --- Students ---

export const getStudents = () => safeParse(KEYS.STUDENTS, []);

export const getStudentById = (id) => {
  const students = getStudents();
  return students.find((s) => s.id === id);
};

export const saveStudent = (student) => {
  const students = getStudents();
  students.push(student);
  setItem(KEYS.STUDENTS, students);
};

export const updateStudent = (updatedStudent, changesDescription) => {
  let students = getStudents();
  students = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
  setItem(KEYS.STUDENTS, students);

  // Add to audit log
  const auditLog = safeParse(KEYS.AUDIT, []);
  auditLog.push({
    studentId: updatedStudent.id,
    changedAt: new Date().toISOString(),
    changedBy: "admin",
    changes: changesDescription,
  });
  setItem(KEYS.AUDIT, auditLog);
};

export const deleteStudent = (id) => {
  const students = getStudents().filter(s => s.id !== id);
  setItem(KEYS.STUDENTS, students);
};

export const generateStudentId = () => {
  const students = getStudents();
  if (students.length === 0) return "STU-001";
  
  const lastId = Math.max(
    ...students.map(s => parseInt(s.id.split('-')[1]))
  );
  return `STU-${String(lastId + 1).padStart(3, "0")}`;
};

// --- Applications ---

export const getApplications = () => safeParse(KEYS.APPLICATIONS, []);

export const saveApplication = (application) => {
  const applications = getApplications();
  applications.push(application);
  setItem(KEYS.APPLICATIONS, applications);
};

export const updateApplicationStatus = (id, newStatus) => {
  let applications = getApplications();
  applications = applications.map((app) => {
    if (app.id === id) {
      if (newStatus === 'Accepted' && app.status !== 'Accepted') {
        const newStudent = {
          name: app.applicantName,
          email: app.email,
          department: app.desiredDepartment,
          level: 'Year 1',
          phone: app.phone,
          id: generateStudentId(),
          createdAt: new Date().toISOString()
        };
        saveStudent(newStudent);
      }
      return { ...app, status: newStatus };
    }
    return app;
  });
  setItem(KEYS.APPLICATIONS, applications);
};

export const generateApplicationId = () => {
  const applications = getApplications();
  if (applications.length === 0) return "APP-001";

  const lastId = Math.max(
    ...applications.map(app => parseInt(app.id.split('-')[1]))
  );
  return `APP-${String(lastId + 1).padStart(3, "0")}`;
};

// --- Parent–teacher messaging & academic progress ---

/** conversationId layout: `${parentUsername}::${professorUsername}::${studentId}` (usernames must not contain "::") */
export const buildConversationId = (parentUsername, professorUsername, studentId) =>
  `${parentUsername}::${professorUsername}::${studentId}`;

export const parseConversationId = (conversationId) => {
  const parts = (conversationId || "").split("::");
  if (parts.length !== 3) return null;
  const [parentUsername, professorUsername, studentId] = parts;
  return { parentUsername, professorUsername, studentId };
};

export const canAccessConversation = (username, role, conversationId) => {
  const p = parseConversationId(conversationId);
  if (!p) return false;
  if (role === "Parent") return username === p.parentUsername;
  if (role === "Professor") return username === p.professorUsername;
  return false;
};

export const getProfessorAccounts = () => {
  const users = getUsers();
  return Object.values(users).filter((u) => u.role === "Professor");
};

export const getParentLinkedStudentId = (parentUsername) => {
  const links = safeParse(KEYS.PARENT_LINKS, {});
  return links[parentUsername] || null;
};

export const getProgressRecord = () =>
  safeParse(KEYS.PROGRESS, { byStudentId: {} });

/** Read-only view for parent's linked child (grades + attendance). */
export const getProgressForStudent = (studentId) => {
  const record = getProgressRecord();
  const slice = record.byStudentId?.[studentId];
  if (!slice) return { grades: [], attendance: [] };
  return {
    grades: slice.grades?.map((g) => ({ ...g })) || [],
    attendance: slice.attendance?.map((a) => ({ ...a })) || [],
  };
};

/** @deprecated Prefer getProgressRecord / getProgressForStudent */
export const getProgress = () => {
  const record = getProgressRecord();
  const firstKey = Object.keys(record.byStudentId || {})[0];
  if (firstKey) return getProgressForStudent(firstKey);
  return { grades: [], attendance: [] };
};

export const getMessages = () => safeParse(KEYS.MESSAGES, []);

export const getMessagesForConversation = (conversationId, username, role) => {
  if (!canAccessConversation(username, role, conversationId)) return [];
  const all = getMessages();
  return all
    .filter((m) => m.conversationId === conversationId)
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export const listConversationIdsForParticipant = (username, role) => {
  const all = getMessages();
  const seen = new Set();
  all.forEach((m) => {
    if (!m.conversationId) return;
    if (canAccessConversation(username, role, m.conversationId))
      seen.add(m.conversationId);
  });

  const knownProfessors =
    role === "Parent"
      ? getProfessorAccounts().map((p) => p.username)
      : [username];

  if (role === "Parent") {
    const sid = getParentLinkedStudentId(username);
    knownProfessors.forEach((prof) => {
      if (sid) seen.add(buildConversationId(username, prof, sid));
    });
  }

  return [...seen];
};

export const appendConversationMessage = ({ conversationId, studentId, fromUsername, fromRole, body }) => {
  if (!conversationId || !studentId || !fromUsername || !fromRole || !String(body || "").trim()) {
    throw new Error("Invalid message payload");
  }
  if (
    !canAccessConversation(fromUsername, fromRole, conversationId)
  ) {
    throw new Error("Not authorized");
  }

  const msg = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    conversationId,
    studentId,
    fromUsername,
    fromRole,
    body: String(body).trim(),
    timestamp: new Date().toISOString(),
    delivered: true,
  };
  const messages = getMessages();
  messages.push(msg);
  setItem(KEYS.MESSAGES, messages);
  broadcastMessagesUpdated();
  return msg;
};

export const markConversationSeen = (username, conversationId, timestampIso) => {
  const prev = safeParse(KEYS.MESSAGE_LAST_SEEN, {});
  if (!prev[username]) prev[username] = {};
  prev[username][conversationId] = timestampIso;
  setItem(KEYS.MESSAGE_LAST_SEEN, prev);
};

export const getLastSeenTimestamp = (username, conversationId) => {
  const prev = safeParse(KEYS.MESSAGE_LAST_SEEN, {});
  return prev[username]?.[conversationId] || null;
};

/** @deprecated Use appendConversationMessage with conversation scope */
export const saveMessage = (message) => {
  const messages = getMessages();
  messages.push({
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    delivered: true,
  });
  setItem(KEYS.MESSAGES, messages);
  broadcastMessagesUpdated();
};
