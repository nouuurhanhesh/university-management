const KEYS = {
  STUDENTS: "students",
  APPLICATIONS: "applications",
  COURSES: "courses",
  STAFF: "staff",
  AUDIT: "auditLog",
  USERS: "systemUsers",
  AUTH: "loggedInUser"
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

export const initStorage = () => {
  const users = safeParse(KEYS.USERS, null);
  if (!users) {
    setItem(KEYS.USERS, {
      admin: { username: "admin", password: "admin123", role: "Administrator" },
      facility: { username: "facility", password: "facility123", role: "Facility Coordinator" }
    });
  }

  if (!localStorage.getItem(KEYS.STUDENTS)) setItem(KEYS.STUDENTS, []);
  if (!localStorage.getItem(KEYS.APPLICATIONS)) setItem(KEYS.APPLICATIONS, []);
  if (!localStorage.getItem(KEYS.COURSES)) setItem(KEYS.COURSES, []);
  if (!localStorage.getItem(KEYS.STAFF)) setItem(KEYS.STAFF, []);
  if (!localStorage.getItem(KEYS.AUDIT)) setItem(KEYS.AUDIT, []);
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
        const existingStudent = getStudents().find(s => s.email === app.email);
        if (!existingStudent) {
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
