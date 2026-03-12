import React, { useState, useMemo, useRef, useEffect } from "react";
import { supabase } from './supabaseClient';

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100vh;overflow:hidden;font-family:'Outfit',sans-serif}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#f1f5f9}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#94a3b8}
input[type=number]::-webkit-inner-spin-button{opacity:1}

/* ── Material Detail slide transition ── */
@keyframes matSlideIn {
  from { transform: translateX(32px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes matFadeUp {
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.mat-detail-enter { animation: matSlideIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
.mat-fade-up      { animation: matFadeUp  0.22s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Markdown body styles ── */
.md-body { line-height:1.75; color:#334155; }
.md-body h2 { font-size:16px; font-weight:800; color:#0f172a; margin:18px 0 7px; letter-spacing:-0.02em; }
.md-body p  { margin:0 0 11px; font-size:13.5px; }
.md-body ul,.md-body ol { margin:0 0 11px 20px; font-size:13.5px; }
.md-body li { margin-bottom:4px; }
.md-body code { font-family:'JetBrains Mono',monospace; font-size:12px; background:#f1f5f9; padding:1px 5px; border-radius:4px; color:#6366f1; }
.md-body pre  { background:#0f172a; border-radius:8px; padding:13px 16px; margin:0 0 13px; overflow-x:auto; }
.md-body pre code { background:none; color:#a5f3fc; padding:0; font-size:12px; line-height:1.65; }
.md-body table { width:100%; border-collapse:collapse; margin:0 0 13px; font-size:12.5px; }
.md-body th { background:#1e293b; color:#94a3b8; padding:7px 11px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.md-body td { padding:7px 11px; border-bottom:1px solid #f1f5f9; color:#334155; }
.md-body tr:last-child td { border-bottom:none; }
.md-body strong { font-weight:700; color:#1e293b; }

/* ── Drop zone ── */
.dropzone { border:2px dashed #c7d2fe; border-radius:10px; transition:all .2s; background:#f8f9ff; cursor:pointer; }
.dropzone:hover, .dropzone.drag-over { border-color:#4f46e5; background:#eff2ff; }

/* ── Sidebar material item hover ── */
.mat-item:hover { background:rgba(99,102,241,.07) !important; }

/* ── Exam Builder ── */
@keyframes builderIn {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}
.exam-builder-enter { animation: builderIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }

/* Question card */
.q-card { border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; transition:border-color .15s, box-shadow .15s; }
.q-card:hover   { border-color:#c7d2fe; }
.q-card.active  { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.10); }
.q-card.preview { border-color:#e2e8f0; pointer-events:none; }

/* MCQ option row */
.mcq-option { display:flex; align-items:center; gap:9px; padding:8px 11px; border-radius:7px; border:1.5px solid #e2e8f0; cursor:pointer; transition:all .12s; }
.mcq-option:hover   { border-color:#a5b4fc; background:#f5f3ff; }
.mcq-option.correct { border-color:#10b981; background:#f0fdf4; }

/* T/F toggle */
.tf-btn { flex:1; padding:10px; border:1.5px solid #e2e8f0; border-radius:8px; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; background:#fff; }
.tf-btn.selected-true  { border-color:#10b981; background:#f0fdf4; color:#065f46; }
.tf-btn.selected-false { border-color:#ef4444; background:#fef2f2; color:#991b1b; }

/* Type selector dropdown */
.qtype-menu { position:absolute; top:calc(100% + 5px); right:0; background:#fff; border:1px solid #e2e8f0; border-radius:9px; padding:5px; z-index:20; box-shadow:0 8px 28px rgba(0,0,0,.12); min-width:180px; }
.qtype-item { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; color:#334155; transition:background .1s; }
.qtype-item:hover { background:#f1f5f9; }

/* Validation error */
.val-error { background:#fee2e2; border:1px solid #fecaca; border-radius:7px; padding:9px 13px; font-size:12px; font-weight:700; color:#dc2626; display:flex; align-items:center; gap:7px; }

/* ── ExamTaker ── */
@keyframes examIn {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}
.exam-enter { animation: examIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }

/* Answer option rows (student-facing) */
.ans-opt { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:9px; border:1.5px solid #e2e8f0; cursor:pointer; transition:all .15s; background:#fff; }
.ans-opt:hover            { border-color:#a5b4fc; background:#f5f3ff; }
.ans-opt.selected         { border-color:#4f46e5; background:#eff2ff; }
.ans-opt.correct-reveal   { border-color:#10b981; background:#f0fdf4; }
.ans-opt.wrong-reveal     { border-color:#ef4444; background:#fef2f2; }

/* Timer */
.exam-timer { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:900; letter-spacing:.04em; }
.exam-timer.urgent { color:#ef4444; animation:timerPulse 1s infinite; }
@keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:.5} }

/* Results summary */
.result-bar-wrap { height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
.result-bar      { height:100%; border-radius:4px; transition:width .6s cubic-bezier(.22,1,.36,1); }

/* ── AG Grid-style grade table cell styling ── */
.grade-cell-pass { background:#f0fdf4 !important; color:#065f46 !important; font-weight:800; }
.grade-cell-warn { background:#fffbeb !important; color:#92400e !important; font-weight:800; }
.grade-cell-fail { background:#fef2f2 !important; color:#dc2626 !important; font-weight:800; }
.grade-cell-high { background:#ede9fe !important; color:#4f46e5 !important; font-weight:900; }

/* Drill-down row */
.drill-row td { background:#f8fafc !important; }
.drill-row:hover td { background:#f0f9ff !important; }

/* ── Grading modal overlay ── */
@keyframes modalIn {
  from { opacity:0; transform:scale(0.96) translateY(8px); }
  to   { opacity:1; transform:scale(1)    translateY(0);   }
}
.modal-overlay {
  position:fixed; inset:0; z-index:100;
  background:rgba(15,23,42,.55); backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center;
}
.modal-box { animation: modalIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Teacher submission row hover ── */
.sub-row:hover td { background:#f0f9ff !important; }

/* ── Edit mode textarea ── */
.edit-textarea {
  border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px;
  font-size:13px; font-family:inherit; resize:vertical; outline:none; width:100%;
  color:#1e293b; background:#fff; min-height:80px;
}
.edit-textarea:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
`;

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const INIT_USERS = [
  { id:"admin",    username:"admin",   password:"admin123", role:"admin",   fullName:"System Administrator", email:"admin@lms.edu", civilStatus:"",       birthdate:"" },
  { id:"STU001",   username:"jdoe",    password:"pass123",  role:"student", fullName:"John Doe",             email:"john.doe@lms.edu",   civilStatus:"Single",  birthdate:"2002-03-15", yearLevel:"2nd Year", semester:"1st Semester" },
  { id:"STU002",   username:"jsmith",  password:"pass123",  role:"student", fullName:"Jane Smith",           email:"jane.smith@lms.edu", civilStatus:"Single",  birthdate:"2001-07-22", yearLevel:"3rd Year", semester:"2nd Semester" },
  { id:"STU003",   username:"bwilson", password:"pass123",  role:"student", fullName:"Bob Wilson",           email:"bob.wilson@lms.edu", civilStatus:"Single",  birthdate:"2003-01-10", yearLevel:"1st Year", semester:"1st Semester" },
  { id:"STU004",   username:"mlee",    password:"pass123",  role:"student", fullName:"Maria Lee",            email:"m.lee@lms.edu",      civilStatus:"Single",  birthdate:"2002-09-05", yearLevel:"2nd Year", semester:"1st Semester" },
  { id:"TCH001",   username:"pjones",  password:"pass123",  role:"teacher", fullName:"Prof. Patricia Jones", email:"p.jones@lms.edu",    civilStatus:"Married", birthdate:"1980-05-20" },
  { id:"TCH002",   username:"mgarcia", password:"pass123",  role:"teacher", fullName:"Prof. Miguel Garcia",  email:"m.garcia@lms.edu",   civilStatus:"Single",  birthdate:"1985-11-30" },
];

const INIT_COURSES = [
  { id:"CS101",   code:"CS101",   name:"Introduction to Computer Science",  teacher:"TCH001", teacherName:"Prof. Patricia Jones", schedule:"MWF 8:00–9:00 AM",   units:3, yearLevel:"1st Year", semester:"1st Semester" },
  { id:"CS201",   code:"CS201",   name:"Data Structures & Algorithms",       teacher:"TCH001", teacherName:"Prof. Patricia Jones", schedule:"TTH 10:00–11:30 AM", units:3, yearLevel:"2nd Year", semester:"1st Semester" },
  { id:"CS301",   code:"CS301",   name:"Object-Oriented Programming",        teacher:"TCH001", teacherName:"Prof. Patricia Jones", schedule:"MWF 1:00–2:00 PM",   units:3, yearLevel:"3rd Year", semester:"1st Semester" },
  { id:"MATH101", code:"MATH101", name:"College Algebra",                    teacher:"TCH002", teacherName:"Prof. Miguel Garcia",  schedule:"MWF 10:00–11:00 AM", units:3, yearLevel:"1st Year", semester:"1st Semester" },
  { id:"MATH201", code:"MATH201", name:"Calculus I",                         teacher:"TCH002", teacherName:"Prof. Miguel Garcia",  schedule:"TTH 1:00–2:30 PM",   units:3, yearLevel:"2nd Year", semester:"1st Semester" },
];

const INIT_ENROLLMENTS = [
  { studentId:"STU001", courseId:"CS201",   grade:92, status:"Enrolled" },
  { studentId:"STU001", courseId:"MATH201", grade:88, status:"Enrolled" },
  { studentId:"STU002", courseId:"CS301",   grade:95, status:"Enrolled" },
  { studentId:"STU002", courseId:"MATH201", grade:79, status:"Enrolled" },
  { studentId:"STU003", courseId:"CS101",   grade:85, status:"Enrolled" },
  { studentId:"STU003", courseId:"MATH101", grade:91, status:"Enrolled" },
  { studentId:"STU004", courseId:"CS201",   grade:77, status:"Enrolled" },
  { studentId:"STU004", courseId:"MATH201", grade:83, status:"Enrolled" },
];

const INIT_MATERIALS = [
  {
    id:"MAT001", courseId:"CS201", title:"Week 1: Arrays & Linked Lists",
    type:"Lecture", date:"2025-08-05", description:"Introduction to linear data structures and memory models.",
    content:`## Learning Objectives
By the end of this lecture you should be able to:
- Understand the structure and memory model of **arrays** and **linked lists**
- Compare time complexities for insert, delete, and search operations
- Implement a singly-linked list in Python from scratch

## Arrays
An array stores elements in **contiguous memory locations**, enabling O(1) random access via index. The trade-off is that insertion/deletion at arbitrary positions costs O(n) due to shifting.

\`\`\`python
arr = [10, 20, 30, 40, 50]
print(arr[2])   # → 30  (O(1) access)
\`\`\`

## Linked Lists
A linked list is a sequence of **nodes**, each holding data and a pointer to the next node. Unlike arrays, linked lists don't require contiguous memory, so prepend is O(1).

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def prepend(self, data):   # O(1)
        node = Node(data)
        node.next = self.head
        self.head = node
\`\`\`

## Complexity Comparison

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access    | O(1)  | O(n)        |
| Search    | O(n)  | O(n)        |
| Insert    | O(n)  | O(1) head   |
| Delete    | O(n)  | O(1) head   |

## Key Takeaway
Choose an **array** when random access is critical. Prefer a **linked list** when frequent head insertions/deletions are needed and random access is rare.`,
  },
  {
    id:"MAT002", courseId:"CS201", title:"Week 2: Stacks & Queues",
    type:"Lecture", date:"2025-08-12", description:"Stack and Queue implementations and applications in Python.",
    content:`## Stacks — LIFO
A stack follows **Last-In, First-Out** order. Think of a stack of plates — you can only add or remove from the top.

\`\`\`python
stack = []
stack.append("a")   # push
stack.append("b")
top = stack.pop()   # → "b"
\`\`\`

**Applications:** function call stacks, undo/redo, expression evaluation.

## Queues — FIFO
A queue follows **First-In, First-Out** order. Elements are enqueued at the rear and dequeued from the front.

\`\`\`python
from collections import deque
q = deque()
q.append("task1")    # enqueue
q.append("task2")
first = q.popleft()  # → "task1"
\`\`\`

**Applications:** BFS graph traversal, job scheduling, print queues.

## Choosing Between Them
Use a **stack** when you need to reverse order or track nested structure. Use a **queue** when order of arrival must be preserved.`,
  },
  {
    id:"MAT003", courseId:"CS301", title:"Week 1: Classes & Objects",
    type:"Lecture", date:"2025-08-05", description:"OOP fundamentals and class design principles.",
    content:`## What is OOP?
Object-Oriented Programming organises code around **objects** — bundles of data (attributes) and behaviour (methods). The four pillars are: **Encapsulation, Abstraction, Inheritance, Polymorphism**.

## Defining a Class

\`\`\`python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner   = owner       # attribute
        self._balance = balance    # protected

    def deposit(self, amount):     # method
        self._balance += amount

    def get_balance(self):
        return self._balance
\`\`\`

## Encapsulation
Hide internal state behind methods. The \`_balance\` attribute above is "protected" by convention — external code should use \`get_balance()\` not read it directly.

## Inheritance

\`\`\`python
class SavingsAccount(BankAccount):
    def __init__(self, owner, rate):
        super().__init__(owner)
        self.rate = rate

    def apply_interest(self):
        self._balance *= (1 + self.rate)
\`\`\``,
  },
  {
    id:"MAT004", courseId:"CS101", title:"Week 1: What is Computer Science?",
    type:"Reading", date:"2025-08-04", description:"Supplementary overview of computer science as a discipline.",
    content:`## Definition
Computer Science is the study of **computation, algorithms, data structures, and the principles** underlying the design of hardware and software systems.

## Core Areas

| Area | Focus |
|------|-------|
| Algorithms & DS | Efficiency of problem-solving procedures |
| Systems | OS, networks, compilers |
| AI & ML | Intelligent behaviour, pattern learning |
| Theory | Computability, complexity, formal languages |
| HCI | Human–computer interaction and UX |

## Why CS Matters
Every industry — healthcare, finance, education, entertainment — is transformed by software. Understanding CS gives you the ability to build tools that scale to billions of users.

## This Course
We start with **Python fundamentals**, move through **data structures**, and end with an introduction to **algorithms analysis**. No prior experience required — just curiosity.`,
  },
  {
    id:"MAT005", courseId:"MATH201", title:"Problem Set 1: Limits & Continuity",
    type:"Assignment", date:"2025-08-08", dueDate:"2025-08-22T23:59:00", points:100,
    description:"Practice problems on limits, continuity, and the epsilon-delta definition.",
    content:`## Instructions
Complete all **4 problems** below. Show full working for each step. Points are awarded for method, not just the final answer.

## Problem 1 — Limit Evaluation (25 pts)
Evaluate the following limits. Justify each step.

- lim(x→2) of (x² - 4) / (x - 2)
- lim(x→0) of sin(x) / x
- lim(x→∞) of (3x² + 2x) / (x² - 1)

## Problem 2 — One-Sided Limits (25 pts)
For f(x) = |x - 3| / (x - 3), find:
- lim(x→3⁺) f(x)
- lim(x→3⁻) f(x)
- Does lim(x→3) f(x) exist? Explain why or why not.

## Problem 3 — Continuity (25 pts)
Determine whether f(x) is continuous at x = 1, where:
**f(x) = x² + 1 if x < 1, and f(x) = 3x - 1 if x ≥ 1.**
Use the three-condition definition of continuity.

## Problem 4 — Epsilon-Delta (25 pts)
Prove using the epsilon-delta definition that lim(x→3) (2x - 1) = 5.

## Submission Requirements
- Submit a single **PDF** with all solutions clearly labelled
- Handwritten work scanned to PDF is acceptable
- Late submissions: -10 points per day`,
  },
  {
    id:"MAT006", courseId:"CS201", title:"Lab 1: Hands-On Linked Lists",
    type:"Lab", date:"2025-08-19", dueDate:"2025-08-19T17:00:00", points:50,
    description:"In-class lab — implement a doubly-linked list with full CRUD operations.",
    content:`## Lab Objectives
Working individually, implement a **doubly-linked list** and verify it with the provided test suite.

## Part A — DNode Class (10 pts)
Create a \`DNode\` class with \`data\`, \`prev\`, and \`next\` attributes. Both pointers should default to \`None\`.

## Part B — DoublyLinkedList Class (30 pts)
Implement the following methods:
- \`append(data)\` — add to tail in O(1)
- \`prepend(data)\` — add to head in O(1)
- \`delete(data)\` — remove first occurrence in O(n)
- \`find(data)\` — return node or None in O(n)
- \`to_list()\` — return Python list representation

## Part C — Edge Cases (10 pts)
Your implementation must handle:
- Deleting from an empty list (raise ValueError)
- Single-node list deletion
- Deleting the head and tail nodes

## Submission
Upload a single **\`.py\` file** before 5:00 PM today. Late lab submissions are not accepted under any circumstances.`,
  },
];

const INIT_EXAMS = [
  {
    id:"EX001", courseId:"CS201", title:"Midterm Exam", date:"2025-09-15", duration:"2 hours", totalPoints:100,
    instantFeedback: true,
    questions: [
      { id:"EXQ01", type:"MCQ", questionText:"Which data structure uses LIFO order?", points:25, correctAnswer:"B",
        options:[{id:"A",label:"Queue"},{id:"B",label:"Stack"},{id:"C",label:"Linked List"},{id:"D",label:"Heap"}] },
      { id:"EXQ02", type:"TF", questionText:"A doubly-linked list node stores two pointers: prev and next.", points:25, correctAnswer:"True" },
      { id:"EXQ03", type:"MCQ", questionText:"What is the time complexity of accessing an element in an array by index?", points:25, correctAnswer:"A",
        options:[{id:"A",label:"O(1)"},{id:"B",label:"O(n)"},{id:"C",label:"O(log n)"},{id:"D",label:"O(n²)"}] },
      { id:"EXQ04", type:"Identification", questionText:"Name the sorting algorithm with average-case time complexity of O(n log n) that uses a pivot element.", points:25, correctAnswer:"Quick Sort" },
    ],
  },
  {
    id:"EX002", courseId:"MATH201", title:"Quiz 1", date:"2025-08-20", duration:"1 hour", totalPoints:50,
    instantFeedback: true,
    questions: [
      { id:"EXQ05", type:"MCQ", questionText:"What is lim(x→0) of sin(x)/x?", points:25, correctAnswer:"B",
        options:[{id:"A",label:"0"},{id:"B",label:"1"},{id:"C",label:"∞"},{id:"D",label:"undefined"}] },
      { id:"EXQ06", type:"TF", questionText:"A function is continuous at x = a if the limit equals the function value at that point.", points:25, correctAnswer:"True" },
    ],
  },
  {
    id:"EX003", courseId:"CS301", title:"Practical Test", date:"2025-09-10", duration:"3 hours", totalPoints:100,
    instantFeedback: false,
    questions: [
      { id:"EXQ07", type:"MCQ", questionText:"Which OOP principle restricts direct access to object components?", points:50, correctAnswer:"C",
        options:[{id:"A",label:"Inheritance"},{id:"B",label:"Polymorphism"},{id:"C",label:"Encapsulation"},{id:"D",label:"Abstraction"}] },
      { id:"EXQ08", type:"Identification", questionText:"What keyword in Python calls the parent class constructor?", points:50, correctAnswer:"super" },
    ],
  },
];

// ─── GLOBAL EXAM SUBMISSIONS STORE ───────────────────────────────────────────
// Lifted to App root so Teacher Grade page sees student submissions immediately.
// Schema: { id, examId, courseId, studentId, answers:{qId→answer}, score, totalPoints, submittedAt, graded:bool }
const INIT_EXAM_SUBMISSIONS = [];

// ─── SUPABASE DATA NORMALIZERS ────────────────────────────────────────────────
// Convert PostgreSQL snake_case rows → app camelCase shape so all
// downstream components stay unchanged.

const normalizeUser = (row) => ({
  id:          row.display_id,
  _uuid:       row.user_id,   // internal UUID — used as FK in DB inserts (created_by, student_id, etc.)
  username:    row.username,
  role:        row.role,
  fullName:    row.full_name,
  email:       row.email        || "",
  civilStatus: row.civil_status || "",
  birthdate:   row.birthdate    || "",
  password:    "",   // never exposed; login uses verify_password RPC
  ...(row.students?.[0] && {
    yearLevel: row.students[0].year_level,
    semester:  row.students[0].semester,
  }),
});

// normalizeCourse was removed: loadCourses() in the App root performs its own
// parallel-fetch mapping and never called this helper. Keeping dead normalizers
// creates false confidence they're tested.



const normalizeEnrollment = (row) => ({
  studentId: row.users?.display_id         || row.student_id,
  courseId:  row.courses?.course_code      || row.course_id,
  grade:     row.final_grade               ?? null,
  status:    row.enrollment_status         || "Enrolled",
});

const normalizeMaterial = (row) => ({
  id:             row.material_id,
  courseId:       row.courses?.course_code || row.course_id,
  title:          row.title,
  type:           row.material_type,
  date:           row.created_at ? row.created_at.split("T")[0] : "",
  dueDate:        row.due_date      || null,
  points:         row.total_points  || null,
  description:    row.description   || "",
  content:        row.content       || "",
  attachment_name: row.attachment_name || null,
  attachment_url:  row.attachment_url  || null,   // Supabase Storage public URL
  term:           row.term          || null,
});

const normalizeExam = (row) => ({
  id:              row.exam_id,
  courseId:        row.courses?.course_code || row.course_id,
  title:           row.title,
  date:            row.exam_date,
  duration:        row.duration_minutes >= 60
    ? `${Math.floor(row.duration_minutes / 60)} hour${Math.floor(row.duration_minutes / 60) > 1 ? "s" : ""}`
    : `${row.duration_minutes} min`,
  totalPoints:     row.total_points,
  instantFeedback: row.instant_feedback,
  term:            row.term || null,
  questions: (row.exam_questions || []).map(q => ({
    id:            q.question_id,
    type:          q.question_type,
    questionText:  q.question_text,
    points:        q.points,
    correctAnswer: q.correct_answer,
    options:       q.options || undefined,
  })).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
});

// Maps DB title-case enum values → app screaming-snake-case constants used by STATUS_META / StatusBadge.
// Without this, StatusBadge looks up "Submitted" in STATUS_META (keyed by "SUBMITTED") and renders nothing.
const DB_TO_STATUS = {
  "Not Submitted": "NOT_SUBMITTED",
  "Submitted":     "SUBMITTED",
  "Late":          "LATE",
  "Graded":        "GRADED",
};

const normalizeWorkSub = (r) => ({
  materialId:   r.material_id,
  submissionId: r.submission_id,
  fileName:     r.file_name,
  fileUrl:      r.file_url     || null,
  fileSize:     r.file_size_kb ? r.file_size_kb * 1024 : 0,
  submittedAt:  r.submitted_at,
  isLate:       r.status === "Late",
  // Map DB title-case → app screaming-snake-case so StatusBadge matches STATUS_META keys
  status:       DB_TO_STATUS[r.status] ?? "NOT_SUBMITTED",
  grade:        r.score ?? null,      // DB column is `score`
  feedback:     r.feedback   || null,
  gradedAt:     r.graded_at  || null,
});


// ─── SUPABASE STORAGE HELPERS ─────────────────────────────────────────────────
// Requires two buckets created in Supabase dashboard → Storage:
//   "submissions" — student work uploads  (set to Public, or use createSignedUrl for private)
//   "materials"   — teacher attachments   (set to Public)
//
// Quick SQL to create them (run once in Supabase SQL editor):
//   insert into storage.buckets (id, name, public) values ('submissions', 'submissions', true);
//   insert into storage.buckets (id, name, public) values ('materials',   'materials',   true);
//
// RLS policies (run once):
//   create policy "anon upload submissions" on storage.objects for insert to anon
//     with check (bucket_id = 'submissions');
//   create policy "anon read submissions"  on storage.objects for select to anon
//     using (bucket_id = 'submissions');
//   create policy "anon upload materials"  on storage.objects for insert to anon
//     with check (bucket_id = 'materials');
//   create policy "anon read materials"    on storage.objects for select to anon
//     using (bucket_id = 'materials');
//
// ── Supabase Realtime setup (required for live teacher submission feed) ────────
// In Supabase Dashboard → Database → Replication → Tables, enable replication for:
//   work_submissions
// Or run once in SQL editor:
//   alter publication supabase_realtime add table work_submissions;

async function uploadFileToStorage(bucket, storagePath, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      upsert:      true,
      contentType: file.type || "application/octet-stream",
    });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

// Sanitise a filename so it is safe as a storage object key
const safeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

// ─── MOCK SUBMISSION DATA ─────────────────────────────────────────────────────
// Simulates what students have already submitted for Lab/Assignment materials.
// Schema mirrors the Zod SubmissionSchema used server-side.
const INIT_SUBMISSIONS = [
  // Problem Set 1 (MAT005 — Assignment, MATH201)
  { id:"SUB001", materialId:"MAT005", studentId:"STU001", studentName:"John Doe",
    fileName:"john_doe_ps1.pdf",    fileSize:198400, submittedAt:"2025-08-20T14:32:00",
    status:"Submitted", grade:null, feedback:null },
  { id:"SUB002", materialId:"MAT005", studentId:"STU004", studentName:"Maria Lee",
    fileName:"maria_lee_ps1.pdf",   fileSize:221600, submittedAt:"2025-08-23T09:15:00",
    status:"Late",      grade:null, feedback:null },
  // Lab 1 (MAT006 — Lab, CS201)
  { id:"SUB003", materialId:"MAT006", studentId:"STU001", studentName:"John Doe",
    fileName:"lab1_jdoe.py",        fileSize:4200,   submittedAt:"2025-08-19T16:47:00",
    status:"Submitted", grade:44,   feedback:"Good implementation. Minor issue in edge-case handling for empty list deletion." },
  { id:"SUB004", materialId:"MAT006", studentId:"STU004", studentName:"Maria Lee",
    fileName:"lab1_mlee.py",        fileSize:3800,   submittedAt:"2025-08-19T17:41:00",
    status:"Late",      grade:null, feedback:null },
];

// Builds the full submission roster for a material (enrolled students who haven't submitted show as Pending)
const buildSubmissionRoster = (materialId, courseId, allUsers, enrollments = [], submissions = []) => {
  const enrolled = enrollments.filter(e => e.courseId === courseId);
  return enrolled.map(e => {
    const sub  = submissions.find(s => s.materialId === materialId && s.studentId === e.studentId);
    const user = allUsers.find(u => u.id === e.studentId);
    return sub
      ? { ...sub, studentName: user?.fullName || e.studentId }
      : { id: null, materialId, studentId: e.studentId, studentName: user?.fullName || e.studentId,
          fileName: null, fileSize: null, submittedAt: null, status:"Pending", grade:null, feedback:null };
  });
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const letterGrade = (g) => g >= 93 ? "A" : g >= 90 ? "A-" : g >= 87 ? "B+" : g >= 83 ? "B" : g >= 80 ? "B-" : g >= 77 ? "C+" : g >= 73 ? "C" : g >= 70 ? "C-" : "D";
const gradeColor  = (g) => g >= 90 ? "#10b981" : g >= 75 ? "#f59e0b" : "#ef4444";

// ── Grade formula: Course Work 30% · Class Standing 30% · Exams 40% ──────────
// When a component has no data yet, its weight is redistributed proportionally
// among the components that do have data so partial grades are still meaningful.
const computeTermGrade = ({ cw, cs, exam }) => {
  const parts = [
    { val: cw,   w: 0.30 },
    { val: cs,   w: 0.30 },
    { val: exam, w: 0.40 },
  ].filter(p => p.val != null);
  if (!parts.length) return null;
  const totalW = parts.reduce((s, p) => s + p.w, 0);
  return Math.round(parts.reduce((s, p) => s + p.val * (p.w / totalW), 0));
};
// Class Standing % = average of Project, Recitation, Attendance (each /100)
const csGradePct = (entry) => {
  if (!entry) return null;
  const nums = [entry.project, entry.recitation, entry.attendance].filter(x => x != null);
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
};

// ─── PRIMITIVE UI ─────────────────────────────────────────────────────────────

const Badge = ({ children, color = "default" }) => {
  const map = {
    default: ["#f1f5f9","#475569"], success:["#d1fae5","#065f46"],
    warning: ["#fef3c7","#92400e"], danger: ["#fee2e2","#991b1b"],
    info:    ["#dbeafe","#1e40af"], purple: ["#ede9fe","#5b21b6"],
    amber:   ["#fef3c7","#b45309"],
  };
  const [bg, txt] = map[color] || map.default;
  return (
    <span style={{ background:bg, color:txt, padding:"2px 8px", borderRadius:9999, fontSize:11, fontWeight:700, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
};

const Input = (props) => (
  <input {...props}
    style={{ border:"1px solid #e2e8f0", borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"inherit", color:"#1e293b", outline:"none", background:"#fff", width:"100%", ...props.style }}
    onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
    onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
  />
);

const Sel = ({ children, ...props }) => (
  <select {...props}
    style={{ border:"1px solid #e2e8f0", borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"inherit", color:"#1e293b", outline:"none", background:"#fff", width:"100%", cursor:"pointer", ...props.style }}
    onFocus={e => { e.target.style.borderColor="#6366f1"; }}
    onBlur={e  => { e.target.style.borderColor="#e2e8f0"; }}
  >{children}</select>
);

const Btn = ({ children, variant="primary", size="md", style:sx, ...rest }) => {
  const vs = {
    primary:   { background:"#4f46e5", color:"#fff",    border:"none" },
    secondary: { background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0" },
    danger:    { background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca" },
    success:   { background:"#d1fae5", color:"#065f46", border:"1px solid #a7f3d0" },
    ghost:     { background:"transparent", color:"#4f46e5", border:"none" },
  };
  const ps = { sm:"5px 10px", md:"8px 16px", lg:"10px 22px" };
  return (
    <button {...rest}
      style={{ ...vs[variant]||vs.primary, padding:ps[size]||ps.md, borderRadius:6, fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, transition:"opacity .15s, transform .1s", ...sx }}
      onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity="1"}
      onMouseDown={e  => e.currentTarget.style.transform="scale(0.97)"}
      onMouseUp={e    => e.currentTarget.style.transform="scale(1)"}
    >{children}</button>
  );
};

const FF = ({ label, required, error, children }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
    <label style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>
      {label}{required && <span style={{ color:"#ef4444" }}> *</span>}
    </label>
    {children}
    {error && <span style={{ fontSize:11, color:"#ef4444" }}>{error}</span>}
  </div>
);

const Card = ({ children, style:sx }) => (
  <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:16, ...sx }}>{children}</div>
);

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
    <div style={{ width:44, height:44, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:22, fontWeight:800, color, lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{label}</div>
    </div>
  </div>
);

const Toast = ({ msg }) => msg ? (
  <div style={{ background:"#d1fae5", border:"1px solid #a7f3d0", borderRadius:8, padding:"9px 14px", color:"#065f46", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
    ✓ {msg}
  </div>
) : null;

// ─── LMS GRID (AG Grid replacement) ──────────────────────────────────────────
function LMSGrid({ columns, rowData, onRowClick, height="100%", pageSize=12, selectedId }) {
  const [q,    setQ]    = useState("");
  const [sc,   setSc]   = useState(null);
  const [dir,  setDir]  = useState("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!q) return rowData;
    const lq = q.toLowerCase();
    return rowData.filter(r => Object.values(r).some(v => String(v ?? "").toLowerCase().includes(lq)));
  }, [rowData, q]);

  const sorted = useMemo(() => {
    if (!sc) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sc] ?? "", vb = b[sc] ?? "";
      return (dir === "asc" ? 1 : -1) * String(va).localeCompare(String(vb), undefined, { numeric:true });
    });
  }, [filtered, sc, dir]);

  const total = Math.max(1, Math.ceil(sorted.length / pageSize));
  const rows  = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (f) => { if (sc === f) setDir(d => d === "asc" ? "desc" : "asc"); else { setSc(f); setDir("asc"); } };

  return (
    <div style={{ display:"flex", flexDirection:"column", height, border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden", background:"#fff" }}>
      {/* Filter bar */}
      <div style={{ padding:"8px 12px", borderBottom:"1px solid #e2e8f0", display:"flex", gap:8, alignItems:"center", background:"#f8fafc", flexShrink:0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={q} onChange={e => { setQ(e.target.value); setPage(0); }} placeholder="Search all columns…"
          style={{ border:"none", background:"transparent", outline:"none", fontSize:13, color:"#1e293b", flex:1, fontFamily:"inherit" }} />
        <span style={{ fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" }}>{sorted.length} record{sorted.length !== 1 ? "s" : ""}</span>
      </div>
      {/* Table */}
      <div style={{ flex:1, overflow:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead style={{ position:"sticky", top:0, zIndex:1 }}>
            <tr>
              {columns.map(col => (
                <th key={col.field+col.header} onClick={() => col.sortable !== false && toggleSort(col.field)}
                  style={{ padding:"9px 12px", textAlign:"left", fontWeight:700, fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", color:"#94a3b8", background:"#1e293b", cursor:col.sortable!==false?"pointer":"default", userSelect:"none", whiteSpace:"nowrap", width:col.width||"auto" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {col.header}
                    {sc === col.field && <span style={{ color:"#a5b4fc" }}>{dir === "asc" ? "↑" : "↓"}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={columns.length} style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:13 }}>No records found</td></tr>
              : rows.map((row, i) => {
                  const isSelected = selectedId && row.id === selectedId;
                  return (
                    <tr key={i} onClick={() => onRowClick && onRowClick(row)}
                      style={{ background:isSelected?"#eff6ff":i%2===0?"#fff":"#f8fafc", cursor:onRowClick?"pointer":"default", borderBottom:"1px solid #f1f5f9", transition:"background .1s" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background="#f0f9ff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected?"#eff6ff":i%2===0?"#fff":"#f8fafc"; }}
                    >
                      {columns.map(col => (
                        <td key={col.field+col.header} style={{ padding:"8px 12px", color:"#334155", verticalAlign:"middle" }}>
                          {col.cellRenderer ? col.cellRenderer(row[col.field], row) : (row[col.field] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div style={{ padding:"7px 12px", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8fafc", flexShrink:0 }}>
        <span style={{ fontSize:11, color:"#64748b" }}>Page {page+1} of {total} · {sorted.length} total</span>
        <div style={{ display:"flex", gap:3 }}>
          {[["«",0],["‹",page-1],["›",page+1],["»",total-1]].map(([lbl, tgt]) => {
            const disabled = lbl==="«"||lbl==="‹" ? page===0 : page===total-1;
            return (
              <button key={lbl} onClick={() => !disabled && setPage(Math.max(0,Math.min(total-1,tgt)))}
                style={{ padding:"3px 8px", border:"1px solid #e2e8f0", borderRadius:4, background:"#fff", cursor:disabled?"not-allowed":"pointer", fontSize:12, color:"#4f46e5", fontFamily:"inherit", opacity:disabled?.4:1 }}>
                {lbl}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SHARED LAYOUT ────────────────────────────────────────────────────────────
function Sidebar({ navItems, active, onNav, user, onLogout }) {
  const roleColor = { admin:"#f59e0b", student:"#10b981", teacher:"#6366f1" }[user.role] || "#6366f1";
  return (
    <div style={{ width:220, background:"#0f172a", height:"100vh", display:"flex", flexDirection:"column", flexShrink:0 }}>
      {/* Logo */}
      <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"#4f46e5", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:15, letterSpacing:"-0.02em" }}>EduLMS</div>
            <div style={{ fontSize:9, color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em" }}>Learning Portal</div>
          </div>
        </div>
      </div>
      {/* User */}
      <div style={{ padding:"10px 12px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:`${roleColor}20`, border:`2px solid ${roleColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:roleColor, flexShrink:0 }}>
            {user.fullName.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#e2e8f0", fontSize:12, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.fullName}</div>
            <div style={{ fontSize:10, color:roleColor, textTransform:"capitalize", fontWeight:600 }}>{user.role} · {user.id}</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:"8px", overflowY:"auto" }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:6, border:"none", cursor:"pointer", marginBottom:2, textAlign:"left", background:active===item.id?"#4f46e5":"transparent", color:active===item.id?"#fff":"#94a3b8", fontFamily:"inherit", fontSize:13, fontWeight:active===item.id?700:400, transition:"all .15s" }}
            onMouseEnter={e => { if (active!==item.id) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { if (active!==item.id) e.currentTarget.style.background="transparent"; }}
          >
            <span style={{ fontSize:15, opacity:.9 }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge != null && <span style={{ background:active===item.id?"rgba(255,255,255,0.2)":"#4f46e5", color:"#fff", fontSize:10, padding:"1px 6px", borderRadius:9999, fontWeight:700 }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      {/* Logout */}
      <div style={{ padding:"8px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={onLogout}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:6, border:"none", cursor:"pointer", background:"transparent", color:"#64748b", fontFamily:"inherit", fontSize:13, transition:"all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.color="#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#64748b"; }}
        >
          <span>⏻</span> Log Out
        </button>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle, actions }) {
  return (
    <div style={{ height:54, background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 22px", gap:16, flexShrink:0 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>{title}</div>
        {subtitle && <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display:"flex", gap:8, alignItems:"center" }}>{actions}</div>}
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0", background:"#fff", padding:"0 20px", flexShrink:0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ padding:"10px 16px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:active===t.id?"#4f46e5":"#64748b", borderBottom:`2px solid ${active===t.id?"#4f46e5":"transparent"}`, marginBottom:-1, transition:"color .15s", whiteSpace:"nowrap" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async (username=u, password=p) => {
    setErr(""); setLoading(true);
    try {
      // 1. Fetch user row (no join — avoids 406 PostgREST relationship errors)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (userError || !userData) {
        setErr("Invalid username or password."); setLoading(false); return;
      }

      // 2. Verify password via the verify_password RPC
      const { data: ok } = await supabase
        .rpc("verify_password", { plain: password, hash: userData.password_hash });

      if (!ok) {
        setErr("Invalid username or password."); setLoading(false); return;
      }

      // 3. Fetch role-specific subclass row separately
      let subData = null;
      if (userData.role === "student") {
        const { data } = await supabase
          .from("students").select("*").eq("user_id", userData.user_id).single();
        subData = { students: data ? [data] : [] };
      } else if (userData.role === "teacher") {
        const { data } = await supabase
          .from("teachers").select("*").eq("user_id", userData.user_id).single();
        subData = { teachers: data ? [data] : [] };
      }

      onLogin(normalizeUser({ ...userData, ...subData }));
    } catch(e) {
      setErr("Connection error. Please try again.");
    }
    setLoading(false);
  };

  const quick = [
    { label:"Admin",   icon:"🛡", u:"admin",   p:"admin123", c:"#f59e0b" },
    { label:"Student", icon:"🎓", u:"jdoe",    p:"pass123",  c:"#10b981" },
    { label:"Teacher", icon:"📖", u:"pjones",  p:"pass123",  c:"#6366f1" },
  ];

  return (
    <div style={{ height:"100vh", display:"flex", overflow:"hidden", background:"#0f172a" }}>
      {/* Left form */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 72px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 25% 55%, rgba(79,70,229,.14) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:380, position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}>
            <div style={{ width:46, height:46, background:"#4f46e5", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:22, letterSpacing:"-0.03em" }}>EduLMS</div>
              <div style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em" }}>Learning Management System</div>
            </div>
          </div>
          <h1 style={{ color:"#fff", fontSize:34, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.2, marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:"#475569", fontSize:14, marginBottom:32 }}>Sign in to access your learning portal.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {[["Username","text",u,setU],["Password","password",p,setP]].map(([lbl,type,val,set]) => (
              <div key={lbl}>
                <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>{lbl}</label>
                <input type={type} value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key==="Enter" && doLogin()}
                  placeholder={`Enter your ${lbl.toLowerCase()}`}
                  style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"11px 14px", fontSize:14, color:"#fff", fontFamily:"inherit", outline:"none" }}
                  onFocus={e => e.target.style.borderColor="#6366f1"}
                  onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.1)"}
                />
              </div>
            ))}
            {err && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"8px 12px", color:"#f87171", fontSize:13 }}>{err}</div>}
            <button onClick={() => doLogin()} disabled={loading}
              style={{ background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, padding:"12px", fontSize:14, fontWeight:800, fontFamily:"inherit", cursor:"pointer", opacity:loading?.7:1, transition:"opacity .15s", letterSpacing:"-0.01em", marginTop:2 }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </div>

          {/* Quick access */}
          <div style={{ marginTop:28 }}>
            <div style={{ fontSize:10, color:"#334155", textTransform:"uppercase", letterSpacing:"0.1em", textAlign:"center", marginBottom:10 }}>Demo Quick Access</div>
            <div style={{ display:"flex", gap:8 }}>
              {quick.map(q => (
                <button key={q.label} onClick={() => { setU(q.u); setP(q.p); doLogin(q.u, q.p); }}
                  style={{ flex:1, padding:"8px 4px", borderRadius:7, border:`1px solid ${q.c}44`, background:`${q.c}11`, color:q.c, fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
                  {q.icon} {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right promo panel */}
      <div style={{ width:400, background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)", display:"flex", flexDirection:"column", justifyContent:"center", padding:48, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(99,102,241,.15)", filter:"blur(40px)" }} />
        <div style={{ position:"absolute", bottom:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"rgba(245,158,11,.1)", filter:"blur(40px)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🎓</div>
          <h2 style={{ color:"#fff", fontSize:26, fontWeight:800, letterSpacing:"-0.02em", lineHeight:1.3, marginBottom:14 }}>Your complete academic ecosystem</h2>
          <p style={{ color:"#a5b4fc", fontSize:13, lineHeight:1.8, marginBottom:28 }}>Manage courses, assignments, grades, and more — unified in one modern platform.</p>
          {[["🏫","Multi-role: Admin, Teacher & Student"],["📚","Full course & material management"],["📊","Real-time grading & grade reports"],["🔒","Secure account management"]].map(([ic,txt]) => (
            <div key={txt} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{ic}</span>
              <span style={{ color:"#c7d2fe", fontSize:13 }}>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function AdminOverview({ users, courses, enrollments }) {
  const students = users.filter(u => u.role==="student");
  const teachers = users.filter(u => u.role==="teacher");
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Admin Overview" subtitle="System summary and quick stats" />
      <div style={{ flex:1, padding:"18px 20px", overflow:"hidden", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, flexShrink:0 }}>
          <StatCard icon="🎓" label="Total Students" value={students.length} color="#10b981" bg="#d1fae5" />
          <StatCard icon="👩‍🏫" label="Total Teachers" value={teachers.length} color="#6366f1" bg="#ede9fe" />
          <StatCard icon="📚" label="Total Courses"  value={courses.length}  color="#f59e0b" bg="#fef3c7" />
          <StatCard icon="📋" label="Enrollments"    value={enrollments.length} color="#3b82f6" bg="#dbeafe" />
        </div>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, overflow:"hidden" }}>
          <Card style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0f172a", marginBottom:10 }}>Students</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <LMSGrid columns={[{field:"id",header:"ID",width:90},{field:"fullName",header:"Name"},{field:"yearLevel",header:"Year",width:90},{field:"semester",header:"Semester"}]} rowData={students} height="100%" pageSize={6} />
            </div>
          </Card>
          <Card style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0f172a", marginBottom:10 }}>Courses</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <LMSGrid columns={[{field:"code",header:"Code",width:80},{field:"name",header:"Course"},{field:"units",header:"Units",width:55}]} rowData={courses} height="100%" pageSize={6} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminCreateAccounts({ users, setUsers }) {
  const emptyForm = { username:"", fullName:"", email:"", civilStatus:"Single", birthdate:"", password:"", yearLevel:"1st Year", semester:"1st Semester" };
  const [role, setRole]     = useState("student");
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState("");
  const [sel, setSel]       = useState(null);

  const upd = (f,v) => setForm(p => ({...p, [f]:v}));

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username="Required";
    if (!form.fullName.trim()) e.fullName="Required";
    if (!form.password.trim()) e.password="Required";
    if (!form.birthdate)       e.birthdate="Required";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    // 3. Insert into users table
    const { data: hashData, error: hashErr } = await supabase
      .rpc("hash_password", { plain: form.password });
    if (hashErr || !hashData) {
      setErrors({ password: "Could not hash password. Run hash_password SQL in Supabase." });
      return;
    }

    // 2. Generate display_id safely from the DB — avoids race conditions and
    //    breaks caused by inactive users excluded from loadUsers() local state.
    const prefix = role === "student" ? "STU" : "TCH";
    const { data: maxRow } = await supabase
      .from("users")
      .select("display_id")
      .eq("role", role)
      .order("display_id", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastNum = maxRow ? parseInt(maxRow.display_id.replace(/\D/g, ""), 10) : 0;
    const nextNum = (isNaN(lastNum) ? 0 : lastNum) + 1;
    const displayId = `${prefix}${String(nextNum).padStart(3, "0")}`;

    // 3. Insert into users table
    const { data: newUserRow, error: userErr } = await supabase
      .from("users")
      .insert({
        display_id:    displayId,
        username:      form.username.trim(),
        full_name:     form.fullName.trim(),
        email:         form.email.trim() || null,
        password_hash: hashData,
        civil_status:  form.civilStatus || null,
        birthdate:     form.birthdate   || null,
        role,
      })
      .select()
      .single();

    if (userErr) {
      setErrors({ username: userErr.message.includes("username") ? "Username already taken" : userErr.message });
      return;
    }

    // 3. Insert into role subclass table
    if (role === "student") {
      await supabase.from("students").insert({
        user_id:    newUserRow.user_id,
        year_level: form.yearLevel,
        semester:   form.semester,
      });
    } else {
      await supabase.from("teachers").insert({
        user_id: newUserRow.user_id,
      });
    }

    // 4. Update local state so grid updates immediately
    const newUser = {
      id:          displayId,
      username:    form.username.trim(),
      fullName:    form.fullName.trim(),
      email:       form.email.trim(),
      civilStatus: form.civilStatus,
      birthdate:   form.birthdate,
      role,
      yearLevel:   form.yearLevel,
      semester:    form.semester,
      password:    "",
    };
    setUsers(prev => [...prev, newUser]);
    setForm(emptyForm); setErrors({});
    setToast(`${role==="student"?"Student":"Teacher"} account created!`);
    setTimeout(() => setToast(""), 3000);
  };

  const cols = [
    {field:"id",      header:"ID",          width:90},
    {field:"fullName",header:"Full Name",    width:150},
    {field:"username",header:"Username",     width:110},
    {field:"role",    header:"Role",         width:80, cellRenderer:v=><Badge color={v==="student"?"success":"purple"}>{v}</Badge>},
    {field:"email",   header:"Email"},
    {field:"civilStatus",header:"Civil Status", width:95},
    {field:"birthdate",  header:"Birthdate",    width:100},
    ...(role==="student"?[{field:"yearLevel",header:"Year",width:90},{field:"semester",header:"Semester",width:110}]:[]),
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Create Accounts" subtitle="Admin · User Management" />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Form */}
        <div style={{ width:320, borderRight:"1px solid #e2e8f0", padding:"16px 18px", display:"flex", flexDirection:"column", gap:11, overflowY:"auto", flexShrink:0, background:"#fff" }}>
          <Toast msg={toast} />
          {/* Role toggle */}
          <div style={{ display:"flex", background:"#f1f5f9", borderRadius:8, padding:3 }}>
            {["student","teacher"].map(r => (
              <button key={r} onClick={() => { setRole(r); setErrors({}); }}
                style={{ flex:1, padding:"7px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, textTransform:"capitalize", transition:"all .15s", background:role===r?"#fff":"transparent", color:role===r?"#4f46e5":"#64748b", boxShadow:role===r?"0 1px 4px rgba(0,0,0,.1)":"none" }}>
                {r==="student"?"🎓 Student":"👩‍🏫 Teacher"}
              </button>
            ))}
          </div>

          <FF label="Username" required error={errors.username}><Input value={form.username} onChange={e=>upd("username",e.target.value)} placeholder="e.g. jdoe" /></FF>
          <FF label="Full Name" required error={errors.fullName}><Input value={form.fullName} onChange={e=>upd("fullName",e.target.value)} placeholder="e.g. John Doe" /></FF>
          <FF label="Email Address"><Input type="email" value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="e.g. john@lms.edu" /></FF>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <FF label="Civil Status">
              <Sel value={form.civilStatus} onChange={e=>upd("civilStatus",e.target.value)}>
                {["Single","Married","Divorced","Widowed"].map(s=><option key={s}>{s}</option>)}
              </Sel>
            </FF>
            <FF label="Birthdate" required error={errors.birthdate}>
              <Input type="date" value={form.birthdate} onChange={e=>upd("birthdate",e.target.value)} />
            </FF>
          </div>

          <FF label="Password" required error={errors.password}><Input type="password" value={form.password} onChange={e=>upd("password",e.target.value)} placeholder="Initial password" /></FF>

          {role==="student" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <FF label="Year Level">
                <Sel value={form.yearLevel} onChange={e=>upd("yearLevel",e.target.value)}>
                  {["1st Year","2nd Year","3rd Year","4th Year"].map(y=><option key={y}>{y}</option>)}
                </Sel>
              </FF>
              <FF label="Semester">
                <Sel value={form.semester} onChange={e=>upd("semester",e.target.value)}>
                  {["1st Semester","2nd Semester","Summer"].map(s=><option key={s}>{s}</option>)}
                </Sel>
              </FF>
            </div>
          )}

          <div style={{ display:"flex", gap:8, paddingTop:4 }}>
            <Btn onClick={submit} style={{ flex:1 }}>✦ Create Account</Btn>
            <Btn variant="secondary" onClick={() => { setForm(emptyForm); setErrors({}); }}>Reset</Btn>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {users.filter(u=>u.role!=="admin").length} Accounts Registered
            </div>
          </div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <LMSGrid columns={cols} rowData={users.filter(u=>u.role!=="admin")} onRowClick={setSel} selectedId={sel?.id} height="100%" />
          </div>
        </div>

        {/* Detail drawer */}
        {sel && (
          <div style={{ width:240, borderLeft:"1px solid #e2e8f0", background:"#fff", padding:"16px 14px", overflowY:"auto", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>Account Details</div>
              <button onClick={()=>setSel(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:18, lineHeight:1 }}>×</button>
            </div>
            <div style={{ textAlign:"center", marginBottom:14 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:sel.role==="student"?"#d1fae5":"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:20, fontWeight:800, color:sel.role==="student"?"#065f46":"#5b21b6" }}>
                {sel.fullName?.charAt(0)}
              </div>
              <div style={{ fontWeight:800, fontSize:14, color:"#1e293b", marginBottom:4 }}>{sel.fullName}</div>
              <Badge color={sel.role==="student"?"success":"purple"}>{sel.role}</Badge>
            </div>
            {[["ID",sel.id],["Username",sel.username],["Email",sel.email],["Civil Status",sel.civilStatus],["Birthdate",sel.birthdate],["Year Level",sel.yearLevel],["Semester",sel.semester]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} style={{ marginBottom:9 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
                <div style={{ fontSize:12, color:"#334155", marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCreateCourses({ courses, setCourses, users, enrollments: enrollmentsProp, setEnrollments }) {
  const teachers = users.filter(u => u.role==="teacher");
  const students = users.filter(u => u.role==="student");
  const [tab, setTab]  = useState("courses");
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const emptyC = { code:"", name:"", teacher:"", schedule:"", units:"3", yearLevel:"1st Year", semester:"1st Semester" };
  const [cf, setCf] = useState(emptyC);
  const updC = (f,v) => setCf(p=>({...p,[f]:v}));

  const [enroll, setEnroll]   = useState({ studentId:"", courseId:"" });
  const [tAssign, setTAssign] = useState({ teacherId:"", courseId:"" });

  // ── Use App-level enrollments directly (no local copy) ──────────────────────
  // This ensures the list survives navigation and logout/re-login.
  const myEnrolls = enrollmentsProp || [];

  const addCourse = async () => {
    if (!cf.code.trim() || !cf.name.trim()) return;
    const t = teachers.find(x => x.id === cf.teacher);

    // 1. Insert the course row
    const { data: newCourse, error } = await supabase
      .from("courses")
      .insert({
        course_code: cf.code.trim().toUpperCase(),
        course_name: cf.name.trim(),
        units:       parseInt(cf.units) || 3,
      })
      .select()
      .single();
    if (error) { showToast(error.message.includes("unique") ? "Course code already exists." : "Error: " + error.message); return; }

    // 2. Insert a schedule row (required so loadCourses() can join year_level/semester)
    let scheduleId = null;
    if (cf.schedule.trim()) {
      const { data: newSched } = await supabase.from("schedules").insert({
        course_id:      newCourse.course_id,
        schedule_label: cf.schedule.trim(),
        academic_year:  "2025-2026",
        semester:       cf.semester  || null,
        year_level:     cf.yearLevel || null,
      }).select("schedule_id").single();
      scheduleId = newSched?.schedule_id || null;
    }

    // 3. Assign teacher (required so loadCourses() can map teacher → course)
    if (t?._uuid) {
      await supabase.from("teacher_course_assignments").upsert({
        teacher_id:    t._uuid,
        course_id:     newCourse.course_id,
        schedule_id:   scheduleId,
        is_primary:    true,
        academic_year: "2025-2026",
        semester:      cf.semester || null,
      }, { onConflict: "teacher_id,course_id,academic_year,semester" });
    }

    setCourses(prev => [...prev, {
      id: newCourse.course_code, code: newCourse.course_code,
      name: newCourse.course_name, units: newCourse.units,
      teacher: cf.teacher || "", teacherName: t?.fullName || "Unassigned",
      schedule: cf.schedule || "", yearLevel: cf.yearLevel || "",
      semester: cf.semester || "", _uuid: newCourse.course_id,
    }]);
    setCf(emptyC); showToast("Course created successfully!");
  };

  const assignStudent = async () => {
    if (!enroll.studentId || !enroll.courseId) return;

    // ── Client-side duplicate guard (uses live App-level state) ───────────────
    if (myEnrolls.find(e => e.studentId===enroll.studentId && e.courseId===enroll.courseId)) {
      showToast("Student is already enrolled in this course."); return;
    }

    // ── Resolve display_id → UUID for both student and course ─────────────────
    const [uRes, cRes] = await Promise.all([
      supabase.from("users").select("user_id").eq("display_id", enroll.studentId).single(),
      supabase.from("courses").select("course_id").eq("course_code", enroll.courseId).single(),
    ]);
    if (uRes.error || cRes.error) { showToast("Could not find student or course."); return; }

    // ── Upsert instead of insert — gracefully handles any DB-level duplicates ──
    // onConflict targets the unique constraint uq_student_course_period.
    const { error } = await supabase.from("student_course_assignments").upsert({
      student_id:        uRes.data.user_id,
      course_id:         cRes.data.course_id,
      enrollment_status: "Enrolled",
      academic_year:     "2025-2026",
      semester:          "1st Semester",
    }, { onConflict: "student_id,course_id,academic_year,semester" });

    if (error) { showToast("Error: " + error.message); return; }

    // ── Update App-level state so the new row survives navigation ──────────────
    const newEntry = { studentId: enroll.studentId, courseId: enroll.courseId, grade: null, status: "Enrolled" };
    setEnrollments(prev => [...prev, newEntry]);

    setEnroll({ studentId:"", courseId:"" }); showToast("Student enrolled!");
  };

  const assignTeacher = async () => {
    if (!tAssign.teacherId || !tAssign.courseId) return;
    const t = teachers.find(x => x.id === tAssign.teacherId);
    const [uRes, cRes] = await Promise.all([
      supabase.from("users").select("user_id").eq("display_id", tAssign.teacherId).single(),
      supabase.from("courses").select("course_id").eq("course_code", tAssign.courseId).single(),
    ]);
    if (uRes.error || cRes.error) { showToast("Could not find teacher or course."); return; }

    // Upsert on (course_id, academic_year, semester) — one teacher per course per period.
    // This requires the DB constraint fix in fix_teacher_constraint.sql to have been run first.
    const { error } = await supabase
      .from("teacher_course_assignments")
      .upsert({
        teacher_id:    uRes.data.user_id,
        course_id:     cRes.data.course_id,
        is_primary:    true,
        academic_year: "2025-2026",
        semester:      "1st Semester",
      }, { onConflict: "course_id,academic_year,semester" });

    if (error) { showToast("Error: " + error.message); return; }
    setCourses(prev => prev.map(c =>
      c.id === tAssign.courseId ? { ...c, teacher: tAssign.teacherId, teacherName: t?.fullName || "" } : c
    ));
    setTAssign({ teacherId:"", courseId:"" });
    showToast("Teacher assigned!");
  };

  const courseCols = [
    {field:"code",       header:"Code",       width:80},
    {field:"name",       header:"Course Name"},
    {field:"teacherName",header:"Teacher",    width:180},
    {field:"schedule",   header:"Schedule",   width:155},
    {field:"units",      header:"Units",      width:55},
    {field:"yearLevel",  header:"Year",       width:90},
    {field:"semester",   header:"Semester",   width:110},
  ];

  const enrollCols = [
    {field:"studentName",header:"Student",    width:160},
    {field:"courseCode", header:"Code",       width:80},
    {field:"courseName", header:"Course"},
    {field:"grade",      header:"Grade",      width:70,  cellRenderer:v=>v!=null?<span style={{fontWeight:700,color:gradeColor(v)}}>{v}%</span>:<Badge>Pending</Badge>},
    {field:"status",     header:"Status",     width:90,  cellRenderer:v=><Badge color="success">{v}</Badge>},
  ];

  const enrollRows = myEnrolls.map(e=>({
    ...e,
    studentName: users.find(u=>u.id===e.studentId)?.fullName||e.studentId,
    courseCode:  courses.find(c=>c.id===e.courseId)?.code||e.courseId,
    courseName:  courses.find(c=>c.id===e.courseId)?.name||e.courseId,
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Course Management" subtitle="Admin · Courses, Schedules & Assignments" />
      <TabBar tabs={[{id:"courses",label:"📚 Courses"},{id:"enroll",label:"🎓 Assign Students"},{id:"teachers",label:"👩‍🏫 Assign Teachers"}]} active={tab} onChange={setTab} />
      <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

        {tab==="courses" && (
          <>
            <div style={{ width:300, borderRight:"1px solid #e2e8f0", padding:16, display:"flex", flexDirection:"column", gap:10, overflowY:"auto", background:"#fff" }}>
              <Toast msg={toast} />
              <FF label="Course Code" required><Input value={cf.code} onChange={e=>updC("code",e.target.value)} placeholder="e.g. CS101" /></FF>
              <FF label="Course Name" required><Input value={cf.name} onChange={e=>updC("name",e.target.value)} placeholder="e.g. Intro to CS" /></FF>
              <FF label="Assign Teacher">
                <Sel value={cf.teacher} onChange={e=>updC("teacher",e.target.value)}>
                  <option value="">— Select Teacher —</option>
                  {teachers.map(t=><option key={t.id} value={t.id}>{t.fullName}</option>)}
                </Sel>
              </FF>
              <FF label="Schedule"><Input value={cf.schedule} onChange={e=>updC("schedule",e.target.value)} placeholder="e.g. MWF 8:00–9:00 AM" /></FF>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <FF label="Units"><Sel value={cf.units} onChange={e=>updC("units",e.target.value)}>{["1","2","3","4","5","6"].map(u=><option key={u}>{u}</option>)}</Sel></FF>
                <FF label="Year"><Sel value={cf.yearLevel} onChange={e=>updC("yearLevel",e.target.value)}>{["1st Year","2nd Year","3rd Year","4th Year"].map(y=><option key={y}>{y}</option>)}</Sel></FF>
              </div>
              <FF label="Semester"><Sel value={cf.semester} onChange={e=>updC("semester",e.target.value)}>{["1st Semester","2nd Semester","Summer"].map(s=><option key={s}>{s}</option>)}</Sel></FF>
              <Btn onClick={addCourse} style={{ marginTop:4 }}>✦ Create Course</Btn>
            </div>
            <div style={{ flex:1, padding:16, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>All Courses ({courses.length})</div>
              <div style={{ flex:1, overflow:"hidden" }}><LMSGrid columns={courseCols} rowData={courses} height="100%" /></div>
            </div>
          </>
        )}

        {tab==="enroll" && (
          <div style={{ flex:1, padding:18, display:"flex", gap:16, overflow:"hidden" }}>
            <Card style={{ width:268, display:"flex", flexDirection:"column", gap:11, flexShrink:0 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0f172a" }}>Enroll Student</div>
              <Toast msg={toast} />
              <FF label="Student"><Sel value={enroll.studentId} onChange={e=>setEnroll(f=>({...f,studentId:e.target.value}))}><option value="">— Select Student —</option>{students.map(s=><option key={s.id} value={s.id}>{s.fullName}</option>)}</Sel></FF>
              <FF label="Course"><Sel value={enroll.courseId} onChange={e=>setEnroll(f=>({...f,courseId:e.target.value}))}><option value="">— Select Course —</option>{courses.map(c=><option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}</Sel></FF>
              <Btn onClick={assignStudent}>Enroll Student</Btn>
            </Card>
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Current Enrollments ({enrollRows.length})</div>
              <div style={{ flex:1, overflow:"hidden" }}><LMSGrid columns={enrollCols} rowData={enrollRows} height="100%" /></div>
            </div>
          </div>
        )}

        {tab==="teachers" && (
          <div style={{ flex:1, padding:18, display:"flex", gap:16, overflow:"hidden" }}>
            <Card style={{ width:268, display:"flex", flexDirection:"column", gap:11, flexShrink:0 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0f172a" }}>Assign Teacher</div>
              <Toast msg={toast} />
              <FF label="Teacher"><Sel value={tAssign.teacherId} onChange={e=>setTAssign(f=>({...f,teacherId:e.target.value}))}><option value="">— Select Teacher —</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.fullName}</option>)}</Sel></FF>
              <FF label="Course"><Sel value={tAssign.courseId} onChange={e=>setTAssign(f=>({...f,courseId:e.target.value}))}><option value="">— Select Course —</option>{courses.map(c=><option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}</Sel></FF>
              <Btn onClick={assignTeacher}>Assign Teacher</Btn>
            </Card>
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Teacher – Course Assignments</div>
              <div style={{ flex:1, overflow:"hidden" }}>
                <LMSGrid columns={[{field:"teacherName",header:"Teacher",width:180},{field:"code",header:"Code",width:80},{field:"name",header:"Course Name"},{field:"schedule",header:"Schedule",width:155},{field:"units",header:"Units",width:55}]} rowData={courses} height="100%" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminViewAccounts({ users }) {
  const [filterRole, setFilterRole] = useState("all");
  const [sel, setSel] = useState(null);
  const data = users.filter(u => u.role!=="admin" && (filterRole==="all"||u.role===filterRole));

  const cols = [
    {field:"id",          header:"ID",           width:90},
    {field:"fullName",    header:"Full Name",     width:160},
    {field:"username",    header:"Username",      width:110},
    {field:"role",        header:"Role",          width:80,  cellRenderer:v=><Badge color={v==="student"?"success":"purple"}>{v}</Badge>},
    {field:"email",       header:"Email"},
    {field:"civilStatus", header:"Civil Status",  width:95},
    {field:"birthdate",   header:"Birthdate",     width:100},
    {field:"yearLevel",   header:"Year",          width:90},
    {field:"semester",    header:"Semester",      width:110},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Account Directory" subtitle="Admin · View & search all accounts"
        actions={
          <div style={{ display:"flex", background:"#f1f5f9", borderRadius:7, padding:3 }}>
            {["all","student","teacher"].map(r=>(
              <button key={r} onClick={()=>setFilterRole(r)}
                style={{ padding:"5px 14px", borderRadius:5, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, textTransform:"capitalize", background:filterRole===r?"#4f46e5":"transparent", color:filterRole===r?"#fff":"#64748b", transition:"all .15s" }}>
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>
        }
      />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <div style={{ flex:1, padding:"14px 18px", display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
          <LMSGrid columns={cols} rowData={data} onRowClick={setSel} selectedId={sel?.id} height="100%" />
        </div>
        {sel && (
          <div style={{ width:248, borderLeft:"1px solid #e2e8f0", background:"#fff", padding:"16px 14px", overflowY:"auto", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>Account Details</div>
              <button onClick={()=>setSel(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:18 }}>×</button>
            </div>
            <div style={{ textAlign:"center", marginBottom:14 }}>
              <div style={{ width:54, height:54, borderRadius:"50%", background:sel.role==="student"?"#d1fae5":"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:22, fontWeight:800, color:sel.role==="student"?"#065f46":"#5b21b6" }}>
                {sel.fullName?.charAt(0)}
              </div>
              <div style={{ fontWeight:800, fontSize:14, color:"#1e293b", marginBottom:4 }}>{sel.fullName}</div>
              <Badge color={sel.role==="student"?"success":"purple"}>{sel.role}</Badge>
            </div>
            {[["ID",sel.id],["Username",sel.username],["Email",sel.email],["Civil Status",sel.civilStatus],["Birthdate",sel.birthdate],["Year Level",sel.yearLevel],["Semester",sel.semester]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} style={{ marginBottom:9 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
                <div style={{ fontSize:12, color:"#334155", marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ user, onLogout, users, setUsers, courses, setCourses, enrollments, setEnrollments }) {
  const [page, setPage] = useState("overview");
  const nav = [
    { id:"overview",         label:"Overview",         icon:"⬡",  badge:null },
    { id:"create-accounts",  label:"Create Accounts",  icon:"➕",  badge:null },
    { id:"create-courses",   label:"Course Management",icon:"📚", badge:courses.length },
    { id:"view-accounts",    label:"Account Directory", icon:"👥", badge:users.filter(u=>u.role!=="admin").length },
  ];
  const pages = {
    overview:        <AdminOverview       users={users} courses={courses} enrollments={enrollments} />,
    "create-accounts": <AdminCreateAccounts users={users} setUsers={setUsers} />,
    "create-courses":  <AdminCreateCourses  courses={courses} setCourses={setCourses} users={users} enrollments={enrollments} setEnrollments={setEnrollments} />,
    "view-accounts":   <AdminViewAccounts   users={users} />,
  };
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar navItems={nav} active={page} onNav={setPage} user={user} onLogout={onLogout} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
        {pages[page]}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATERIAL DETAIL — TypeScript Enum equivalent (frozen object mirrors TS enum)
// enum MaterialType { LECTURE="Lecture", READING="Reading", LAB="Lab", ASSIGNMENT="Assignment" }
// ═══════════════════════════════════════════════════════════════════════════════

const MaterialType = Object.freeze({
  LECTURE:    "Lecture",
  READING:    "Reading",
  LAB:        "Lab",
  ASSIGNMENT: "Assignment",
});

// Academic term periods — used by both Materials and Exams
const EXAM_TERMS = ["Prelim", "Midterm", "Semi-Final", "Finals"];
const TERM_META = {
  "Prelim":     { color:"#6366f1", bg:"#ede9fe" },
  "Midterm":    { color:"#0ea5e9", bg:"#dbeafe" },
  "Semi-Final": { color:"#f59e0b", bg:"#fef3c7" },
  "Finals":     { color:"#ef4444", bg:"#fee2e2" },
};

// Type predicate — mirrors: (type): type is LAB | ASSIGNMENT => [...]includes(type)
const isSubmittable = (type) =>
  type === MaterialType.LAB || type === MaterialType.ASSIGNMENT;

const MAT_META = {
  [MaterialType.LECTURE]:    { icon:"🎙", color:"#6366f1", bg:"#ede9fe", light:"#f5f3ff", label:"Lecture"    },
  [MaterialType.READING]:    { icon:"📖", color:"#0ea5e9", bg:"#dbeafe", light:"#f0f9ff", label:"Reading"    },
  [MaterialType.LAB]:        { icon:"🧪", color:"#10b981", bg:"#d1fae5", light:"#f0fdf4", label:"Lab"        },
  [MaterialType.ASSIGNMENT]: { icon:"📝", color:"#f59e0b", bg:"#fef3c7", light:"#fffbeb", label:"Assignment" },
};

const SubmissionStatus = Object.freeze({
  NOT_SUBMITTED: "NOT_SUBMITTED",
  SUBMITTED:     "SUBMITTED",
  LATE:          "LATE",
  GRADED:        "GRADED",
});

const STATUS_META = {
  [SubmissionStatus.NOT_SUBMITTED]: { label:"Not Submitted", icon:"○", color:"#64748b", bg:"#f1f5f9" },
  [SubmissionStatus.SUBMITTED]:     { label:"Submitted",     icon:"✓", color:"#10b981", bg:"#d1fae5" },
  [SubmissionStatus.LATE]:          { label:"Late",          icon:"⚠", color:"#ef4444", bg:"#fee2e2" },
  [SubmissionStatus.GRADED]:        { label:"Graded",        icon:"★", color:"#f59e0b", bg:"#fef3c7" },
};

// ── TypeBadge ─────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const m = MAT_META[type] || MAT_META[MaterialType.LECTURE];
  return (
    <span style={{ background:m.bg, color:m.color, padding:"3px 9px", borderRadius:9999, fontSize:11, fontWeight:800, display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
      {m.icon} {m.label}
    </span>
  );
};

// ── StatusBadge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META[SubmissionStatus.NOT_SUBMITTED];
  return (
    <span style={{ background:m.bg, color:m.color, padding:"4px 10px", borderRadius:9999, fontSize:12, fontWeight:800, display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ fontSize:10 }}>{m.icon}</span> {m.label}
    </span>
  );
};

// ── Lightweight Markdown Renderer ─────────────────────────────────────────────
function renderMarkdown(raw) {
  const lines  = raw.split("\n");
  const output = [];
  let inPre = false, preLines = [];

  const flush = () => {
    output.push(<pre key={`pre-${output.length}`}><code dangerouslySetInnerHTML={{ __html: preLines.join("\n") }} /></pre>);
    preLines = []; inPre = false;
  };
  const inline = (str) =>
    str.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
       .replace(/`([^`]+)`/g,"<code>$1</code>")
       .replace(/\*(.*?)\*/g,"<em>$1</em>");

  let tableRows = [], inTable = false;
  const flushTable = () => {
    if (!tableRows.length) return;
    const [header, , ...body] = tableRows;
    const ths = header.split("|").filter(Boolean).map(h=>h.trim());
    const trs = body.map((row,ri)=>{
      const tds = row.split("|").filter(Boolean).map(c=>c.trim());
      return <tr key={ri}>{tds.map((td,ci)=><td key={ci} dangerouslySetInnerHTML={{__html:inline(td)}}/>)}</tr>;
    });
    output.push(<table key={`tbl-${output.length}`}><thead><tr>{ths.map((th,i)=><th key={i}>{th}</th>)}</tr></thead><tbody>{trs}</tbody></table>);
    tableRows = []; inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) { if (inPre) flush(); else inPre = true; continue; }
    if (inPre) { preLines.push(line); continue; }
    if (line.startsWith("|")) { inTable = true; tableRows.push(line); continue; }
    if (inTable) flushTable();
    if      (line.startsWith("## ")) output.push(<h2 key={i} dangerouslySetInnerHTML={{__html:inline(line.slice(3))}}/>);
    else if (line.startsWith("# "))  output.push(<h2 key={i} style={{fontSize:20}} dangerouslySetInnerHTML={{__html:inline(line.slice(2))}}/>);
    else if (line.startsWith("- "))  output.push(<ul key={i}><li dangerouslySetInnerHTML={{__html:inline(line.slice(2))}}/></ul>);
    else if (/^\d+\. /.test(line))   output.push(<ol key={i}><li dangerouslySetInnerHTML={{__html:inline(line.replace(/^\d+\. /,""))}}/></ol>);
    else if (line.trim() === "")     output.push(<div key={i} style={{height:5}}/>);
    else output.push(<p key={i} dangerouslySetInnerHTML={{__html:inline(line)}}/>);
  }
  if (inTable) flushTable();
  if (inPre)   flush();
  return output;
}

// ── FileUploadZone ────────────────────────────────────────────────────────────
const fmtSize  = (b) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
const fileIcon = (name) => name?.endsWith(".pdf") ? "📄" : "📝";
const ALLOWED  = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function FileUploadZone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState("");
  const inputRef = useRef(null);

  const validate = (f) => {
    setError("");
    if (!ALLOWED.includes(f.type) && ![".pdf",".doc",".docx"].some(e=>f.name.endsWith(e))) {
      setError("Only PDF and Word documents are accepted."); return false;
    }
    if (f.size > 20 * 1024 * 1024) { setError("File exceeds 20 MB limit."); return false; }
    return true;
  };
  const handle = (f) => { if (f && validate(f)) onFile(f); };

  return (
    <div>
      <div
        className={`dropzone${dragging ? " drag-over" : ""}`}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{ padding:"24px 16px", textAlign:"center" }}
      >
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
          onChange={e => handle(e.target.files?.[0])} />
        {dragging
          ? <><div style={{fontSize:30,marginBottom:6}}>⬇</div><div style={{fontSize:13,fontWeight:700,color:"#4f46e5"}}>Drop your file here</div></>
          : <>
              <div style={{fontSize:28,marginBottom:6}}>☁</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:3}}>Drag & drop your file</div>
              <div style={{fontSize:12,color:"#64748b"}}>or <span style={{color:"#4f46e5",fontWeight:700}}>click to browse</span></div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>PDF, DOC, DOCX · Max 20 MB</div>
            </>
        }
      </div>
      {error && <div style={{marginTop:5,fontSize:11,color:"#ef4444",fontWeight:600}}>⚠ {error}</div>}
    </div>
  );
}

// ── SubmissionPortal ──────────────────────────────────────────────────────────
function SubmissionPortal({ material, user, existingSubmission, onSubmissionSaved }) {
  // Restore from DB if student already submitted this material
  const [file,      setFile]      = useState(() =>
    existingSubmission?.fileName ? { name: existingSubmission.fileName, size: existingSubmission.fileSize || 0 } : null
  );
  const [status,    setStatus]    = useState(() => {
    if (!existingSubmission?.fileName) return SubmissionStatus.NOT_SUBMITTED;
    return existingSubmission.isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;
  });
  const [submitted, setSubmitted] = useState(() => !!existingSubmission?.fileName);
  const [submitAt,  setSubmitAt]  = useState(() => existingSubmission?.submittedAt || null);
  const [toast,     setToast]     = useState("");

  // Sync if existingSubmission arrives asynchronously (parent fetches after mount)
  useEffect(() => {
    if (existingSubmission?.fileName && !submitted) {
      setFile({ name: existingSubmission.fileName, size: existingSubmission.fileSize || 0 });
      setStatus(existingSubmission.isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);
      setSubmitted(true);
      setSubmitAt(existingSubmission.submittedAt || null);
    }
  }, [existingSubmission]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const dueDate   = material.dueDate ? new Date(material.dueDate) : null;
  const isLate    = dueDate && new Date() > dueDate;
  const fmtDate   = (iso) => iso ? new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";

  const submit = async () => {
    if (!file) return;
    const now       = new Date().toISOString();
    const newStatus = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;
    // DB enum values are title-cased: 'Submitted' | 'Late'
    const dbStatus  = isLate ? "Late" : "Submitted";

    if (user?._uuid && material?.id) {
      // ── 1. Upload actual file bytes to Supabase Storage ──────────────────────
      let fileUrl = null;
      if (file instanceof File) {
        // Path: submissions/{material_id}/{student_uuid}/{timestamp}_{filename}
        const storagePath = `${material.id}/${user._uuid}/${Date.now()}_${safeFileName(file.name)}`;
        try {
          showToast("Uploading file…");
          fileUrl = await uploadFileToStorage("submissions", storagePath, file);
        } catch (uploadErr) {
          showToast("Upload failed: " + uploadErr.message);
          return;
        }
      }

      // ── 2. Persist metadata + storage URL to work_submissions ────────────────
      const { error } = await supabase.from("work_submissions").upsert({
        material_id:  material.id,
        student_id:   user._uuid,
        file_name:    file.name,
        file_size_kb: file.size ? Math.ceil(file.size / 1024) : null,  // column is file_size_kb
        file_url:     fileUrl,
        submitted_at: now,
        status:       dbStatus,   // enum: 'Submitted' | 'Late' (title-case)
      }, { onConflict: "material_id,student_id" });
      if (error) { showToast("Error saving: " + error.message); return; }
    }

    setSubmitted(true);
    setSubmitAt(now);
    setStatus(newStatus);
    onSubmissionSaved?.({ materialId: material.id, fileName: file.name, fileSize: file.size || 0,
      submittedAt: now, isLate: !!isLate, status: newStatus });
    showToast(isLate ? "Submitted (late — check policy)" : "Submitted successfully!");
  };

  const replace = () => { setFile(null); setSubmitted(false); setStatus(SubmissionStatus.NOT_SUBMITTED); setSubmitAt(null); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, height:"100%", overflowY:"auto" }}>
      {/* Status row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>Submission Portal</div>
        <StatusBadge status={status} />
      </div>

      {/* Due date banner */}
      {dueDate && (
        <div style={{ background:isLate?"#fee2e2":"#f0fdf4", border:`1px solid ${isLate?"#fecaca":"#bbf7d0"}`, borderRadius:8, padding:"9px 12px", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <span style={{fontSize:15}}>{isLate?"⚠":"📅"}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:isLate?"#991b1b":"#14532d",textTransform:"uppercase",letterSpacing:"0.05em"}}>{isLate?"Overdue":"Due Date"}</div>
            <div style={{fontSize:11,color:isLate?"#dc2626":"#15803d"}}>{fmtDate(material.dueDate)}</div>
          </div>
          {material.points && <div style={{fontSize:13,fontWeight:900,color:isLate?"#dc2626":"#15803d"}}>{material.points}pts</div>}
        </div>
      )}

      {/* Upload zone — hidden once submitted */}
      {!submitted && <FileUploadZone onFile={setFile} />}

      {/* Selected file card */}
      {file && (
        <div className="mat-fade-up" style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <span style={{fontSize:22}}>{fileIcon(file.name)}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:"#1e293b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{file.name}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
              {fmtSize(file.size)}
              {submitted && submitAt && <span style={{marginLeft:6}}>· {fmtDate(submitAt)}</span>}
            </div>
          </div>
          {!submitted && <button onClick={()=>setFile(null)} style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",fontSize:18,lineHeight:1}}>×</button>}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
        {!submitted
          ? <Btn onClick={submit} disabled={!file} style={{flex:1,justifyContent:"center"}}>
              ↑ Submit {material.type === MaterialType.LAB ? "Lab" : "Assignment"}
            </Btn>
          : <>
              <div style={{flex:1,padding:"8px 12px",background:"#d1fae5",borderRadius:6,fontSize:12,fontWeight:700,color:"#065f46",display:"flex",alignItems:"center",gap:6}}>
                ✓ {status===SubmissionStatus.LATE?"Late submission received":"Confirmed"}
              </div>
              <Btn variant="ghost" size="sm" onClick={replace}>Replace</Btn>
            </>
        }
      </div>

      {/* Toast */}
      {toast && (
        <div className="mat-fade-up" style={{background:"#0f172a",color:"#a5f3fc",borderRadius:7,padding:"8px 12px",fontSize:11,fontWeight:700,flexShrink:0}}>
          {toast}
        </div>
      )}

      {/* Checklist */}
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 12px", flexShrink:0, marginTop:"auto" }}>
        <div style={{fontSize:10,fontWeight:800,color:"#0f172a",marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>Checklist</div>
        {[
          [!!file,     "File attached (.pdf or .docx)"],
          [dueDate && new Date() <= dueDate, "Submitted before due date"],
          [submitted,  "Confirmation received"],
        ].map(([done,lbl],i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,fontSize:11,color:done?"#065f46":"#94a3b8"}}>
            <span style={{fontSize:12}}>{done?"✅":"○"}</span> {lbl}
          </div>
        ))}
      </div>

      {/* Grade result card — shown once teacher has graded */}
      {existingSubmission?.grade != null && (
        <div className="mat-fade-up" style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"2px solid #86efac", borderRadius:10, padding:"14px 16px", flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#14532d", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>
            🎓 Grade Received
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: existingSubmission.feedback ? 10 : 0 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background: existingSubmission.grade >= 75 ? "#16a34a" : "#dc2626",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:17, fontWeight:900, color:"#fff" }}>{existingSubmission.grade}%</span>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:900, color: existingSubmission.grade >= 75 ? "#15803d" : "#b91c1c" }}>
                {existingSubmission.grade >= 90 ? "Excellent!" : existingSubmission.grade >= 75 ? "Passed" : "Below Passing"}
              </div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>
                Score: {existingSubmission.grade} / {material.points ?? "—"} pts
              </div>
            </div>
          </div>
          {existingSubmission.feedback && (
            <div style={{ background:"rgba(255,255,255,.7)", borderRadius:7, padding:"9px 11px", fontSize:12, color:"#334155", lineHeight:1.55 }}>
              <div style={{ fontSize:9, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Teacher's Feedback</div>
              {existingSubmission.feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── LectureView — used for LECTURE and READING types ─────────────────────────
function LectureView({ material }) {
  const m = MAT_META[material.type] || MAT_META[MaterialType.LECTURE];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Banner */}
      <div style={{ background:`linear-gradient(135deg,${m.light} 0%,#fff 100%)`, borderBottom:"1px solid #e2e8f0", padding:"14px 22px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:11, background:m.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
            {m.icon}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
              <TypeBadge type={material.type} />
              <span style={{ fontSize:11, color:"#94a3b8" }}>{material.date}</span>
            </div>
            <h1 style={{ fontSize:18, fontWeight:900, color:"#0f172a", letterSpacing:"-0.02em", marginBottom:3 }}>{material.title}</h1>
            <p style={{ fontSize:12, color:"#64748b", margin:0 }}>{material.description}</p>
          </div>
          {/* Read-only lock badge */}
          <div style={{ background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 12px", textAlign:"center", flexShrink:0 }}>
            <div style={{ fontSize:14, marginBottom:2 }}>🔒</div>
            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Read Only</div>
          </div>
        </div>
      </div>
      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 26px 28px" }}>
        <div className="md-body">
          {material.content
            ? renderMarkdown(material.content)
            : <p style={{ color:"#94a3b8", fontStyle:"italic" }}>No content available.</p>
          }
        </div>
        {/* Teacher attachment download */}
        {material.attachment_url && (
          <div style={{ marginTop:18, padding:"11px 14px", background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>{fileIcon(material.attachment_name)}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#0369a1", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{material.attachment_name || "Attachment"}</div>
              <div style={{ fontSize:10, color:"#64748b" }}>Attached file</div>
            </div>
            <Btn variant="ghost" size="sm" style={{ border:"1px solid #7dd3fc" }}
              onClick={() => window.open(material.attachment_url, "_blank", "noopener,noreferrer")}>
              ⬇ Download
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AssignmentView — used for ASSIGNMENT and LAB types (dual-pane) ────────────
function AssignmentView({ material, user, existingSubmission, onSubmissionSaved }) {
  const m = MAT_META[material.type] || MAT_META[MaterialType.ASSIGNMENT];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Banner */}
      <div style={{ background:`linear-gradient(135deg,${m.light} 0%,#fff 100%)`, borderBottom:"1px solid #e2e8f0", padding:"12px 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:m.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
            {m.icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
              <TypeBadge type={material.type} />
              <span style={{ fontSize:11, color:"#94a3b8" }}>{material.date}</span>
              {material.points && <span style={{ fontSize:11, fontWeight:800, color:m.color }}>· {material.points} pts</span>}
            </div>
            <div style={{ fontSize:17, fontWeight:900, color:"#0f172a", letterSpacing:"-0.02em" }}>{material.title}</div>
          </div>
        </div>
      </div>
      {/* Dual pane */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* LEFT — instructions */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", borderRight:"1px solid #e2e8f0" }}>
          <div style={{ padding:"8px 18px", borderBottom:"1px solid #f1f5f9", background:"#fafafa", flexShrink:0 }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>📋 Instructions & Objectives</span>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 22px" }}>
            <div className="md-body">
              {material.content
                ? renderMarkdown(material.content)
                : <p style={{ color:"#94a3b8", fontStyle:"italic" }}>No instructions provided.</p>
              }
            </div>
            {/* Teacher attachment download */}
            {material.attachment_url && (
              <div style={{ marginTop:14, padding:"10px 13px", background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:16 }}>{fileIcon(material.attachment_name)}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#0369a1", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{material.attachment_name || "Attachment"}</div>
                  <div style={{ fontSize:10, color:"#64748b" }}>Reference file</div>
                </div>
                <Btn variant="ghost" size="sm" style={{ border:"1px solid #7dd3fc" }}
                  onClick={() => window.open(material.attachment_url, "_blank", "noopener,noreferrer")}>
                  ⬇ Download
                </Btn>
              </div>
            )}
          </div>
        </div>
        {/* RIGHT — submission portal */}
        <div style={{ width:300, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, background:"#fdfdff" }}>
          <div style={{ padding:"8px 15px", borderBottom:"1px solid #f1f5f9", background:"#fafafe", flexShrink:0 }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>📤 Submission Portal</span>
          </div>
          <div style={{ flex:1, padding:"12px 14px", overflow:"hidden" }}>
            <SubmissionPortal material={material} user={user} existingSubmission={existingSubmission} onSubmissionSaved={onSubmissionSaved} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MaterialDetailView — the main conditional container ───────────────────────
// Implements: selectedMaterial ? <MaterialDetailView /> : <DefaultCourseView />
// Back button sets selectedMaterial → null in the parent (StudentCourses)
function MaterialDetailView({ material, onBack, course, user, existingSubmission, onSubmissionSaved }) {
  // Conditional rendering gate:
  //   isSubmittable(type) → AssignmentView (dual-pane + submission portal)
  //   else               → LectureView    (full-width read-only content)
  const showAssignmentLayout = isSubmittable(material.type);

  return (
    <div className="mat-detail-enter" style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Breadcrumb top-bar */}
      <div style={{ height:46, background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 16px", gap:10, flexShrink:0 }}>
        {/* Back button → sets selectedMaterial to null in parent */}
        <button onClick={onBack}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:12, fontWeight:700, color:"#475569", fontFamily:"inherit" }}
          onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
          onMouseLeave={e => e.currentTarget.style.background="#f8fafc"}
        >
          ← Back to Courses
        </button>
        {/* Breadcrumb */}
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94a3b8", flex:1, minWidth:0 }}>
          <span>My Courses</span>
          {course && <><span>›</span><span>{course.code}</span></>}
          <span>›</span>
          <span style={{ color:"#1e293b", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{material.title}</span>
        </div>
        <TypeBadge type={material.type} />
      </div>

      {/* Conditional layout — the core ternary */}
      {showAssignmentLayout
        ? <AssignmentView material={material} user={user} existingSubmission={existingSubmission} onSubmissionSaved={onSubmissionSaved} />
        : <LectureView    material={material} />
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM TAKER — Student-Side
// ═══════════════════════════════════════════════════════════════════════════════

// ── useExamTimer ──────────────────────────────────────────────────────────────
function useExamTimer(durationStr, onExpire) {
  const parseSeconds = (s) => {
    const h = s.match(/(\d+)\s*hour/i);  const m = s.match(/(\d+)\s*min/i);
    return ((h?parseInt(h[1]):0)*3600) + ((m?parseInt(m[1]):0)*60) || 3600;
  };
  const [secs, setSecs] = useState(() => parseSeconds(durationStr));
  useEffect(() => {
    if (secs <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const fmt = (n) => String(n).padStart(2,"0");
  return { display: `${fmt(h)}:${fmt(m)}:${fmt(s)}`, urgent: secs < 300, expired: secs <= 0 };
}

// ── ResultsSummary ────────────────────────────────────────────────────────────
// Post-submission screen — shows score, per-question breakdown, instant feedback.
function ResultsSummary({ exam, answers, submission, onBack }) {
  const { score, totalPoints } = submission;
  const pct  = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  const pass = pct >= 75;

  const fmtAnswer = (q, ans) => {
    if (!ans) return "—";
    if (q.type === "MCQ") return `${ans}. ${q.options?.find(o=>o.id===ans)?.label||ans}`;
    return ans;
  };

  return (
    <div className="exam-enter" style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Result header */}
      <div style={{ background: pass ? "linear-gradient(135deg,#064e3b,#065f46)" : "linear-gradient(135deg,#7f1d1d,#991b1b)", padding:"20px 28px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0 }}>
            {pass ? "🏆" : "📋"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.6)", marginBottom:3 }}>{exam.title}</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#fff", letterSpacing:"-0.02em" }}>
              {score} / {totalPoints} points
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6 }}>
              <div style={{ flex:1, maxWidth:200 }}>
                <div className="result-bar-wrap">
                  <div className="result-bar" style={{ width:`${pct}%`, background: pct>=90?"#a7f3d0": pct>=75?"#6ee7b7":"#fca5a5" }} />
                </div>
              </div>
              <span style={{ fontSize:22, fontWeight:900, color: pct>=90?"#6ee7b7": pct>=75?"#a7f3d0":"#fca5a5" }}>{pct}%</span>
              <Badge color={pass?"success":"danger"}>{pass?"PASSED":"FAILED"}</Badge>
            </div>
          </div>
          <Btn variant="ghost" onClick={onBack} style={{ color:"rgba(255,255,255,.8)", border:"1px solid rgba(255,255,255,.25)", flexShrink:0 }}>
            ← Back to Courses
          </Btn>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"flex", background:"#1e293b", flexShrink:0 }}>
        {[
          ["Score",       `${score}/${totalPoints}`,                         "#a5f3fc"],
          ["Percentage",  `${pct}%`,                                         pct>=75?"#6ee7b7":"#fca5a5"],
          ["Questions",   exam.questions?.length || 0,                       "#c4b5fd"],
          ["Correct",     exam.questions?.filter(q=>answers[q.id]===q.correctAnswer).length || 0, "#86efac"],
          ["Status",      pass?"Passed":"Failed",                            pass?"#6ee7b7":"#fca5a5"],
        ].map(([lbl,val,col])=>(
          <div key={lbl} style={{ flex:1, textAlign:"center", padding:"10px 6px", borderRight:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize:16, fontWeight:900, color:col }}>{val}</div>
            <div style={{ fontSize:10, color:"#475569", marginTop:2, textTransform:"uppercase", letterSpacing:"0.05em" }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Per-question breakdown (scrollable) */}
      <div style={{ flex:1, overflowY:"auto", padding:"18px 24px", background:"#f8fafc" }}>
        {!exam.instantFeedback
          ? (
            <div style={{ textAlign:"center", padding:"40px", color:"#64748b" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🔒</div>
              <div style={{ fontWeight:800, fontSize:15, color:"#1e293b", marginBottom:6 }}>Answers Hidden</div>
              <div style={{ fontSize:13 }}>The teacher has disabled instant feedback for this exam. Results will be released manually.</div>
            </div>
          )
          : (
            <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:760, margin:"0 auto" }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
                📊 Answer Review
              </div>
              {(exam.questions||[]).map((q, i) => {
                const given   = answers[q.id];
                const isRight = given === q.correctAnswer;
                return (
                  <div key={q.id} style={{ background:"#fff", border:`1.5px solid ${isRight?"#bbf7d0":"#fecaca"}`, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:isRight?"#d1fae5":"#fee2e2", color:isRight?"#065f46":"#dc2626", fontSize:13, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {isRight ? "✓" : "✗"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginBottom:6 }}>{i+1}. {q.questionText}</div>

                        {/* MCQ options with highlights */}
                        {q.type === "MCQ" && (
                          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                            {(q.options||[]).map(opt => (
                              <div key={opt.id}
                                className={`ans-opt ${opt.id===q.correctAnswer?"correct-reveal":""} ${opt.id===given&&!isRight?"wrong-reveal":""}`}
                                style={{ cursor:"default", fontSize:12 }}>
                                <span style={{ fontWeight:800, color:"#94a3b8", minWidth:18 }}>{opt.id}.</span>
                                <span style={{ flex:1 }}>{opt.label}</span>
                                {opt.id===q.correctAnswer && <span style={{fontSize:10,fontWeight:800,color:"#10b981"}}>✓ Correct</span>}
                                {opt.id===given&&!isRight && <span style={{fontSize:10,fontWeight:800,color:"#ef4444"}}>Your answer</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* T/F */}
                        {q.type === "TF" && (
                          <div style={{ fontSize:12, color:"#64748b" }}>
                            <span>Your answer: <strong style={{color:isRight?"#065f46":"#dc2626"}}>{given||"No answer"}</strong></span>
                            {!isRight && <span style={{marginLeft:12}}>Correct: <strong style={{color:"#065f46"}}>{q.correctAnswer}</strong></span>}
                          </div>
                        )}

                        {/* Identification */}
                        {q.type === "Identification" && (
                          <div style={{ fontSize:12, color:"#64748b" }}>
                            <span>Your answer: <strong style={{color:isRight?"#065f46":"#dc2626"}}>{given||"No answer"}</strong></span>
                            {!isRight && <span style={{marginLeft:12}}>Expected: <strong style={{color:"#065f46"}}>{q.correctAnswer}</strong></span>}
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink:0, fontSize:11, fontWeight:800, color:isRight?"#065f46":"#94a3b8" }}>
                        {isRight ? `+${q.points}` : "0"} pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── ExamTaker ─────────────────────────────────────────────────────────────────
// Full content-area takeover when student clicks "Take Exam →".
// Layout: [Breadcrumb 46px] [Timer+meta strip 52px] [Questions scroll flex:1] [Submit footer 64px]
// State synchronization: onSubmit(submission) propagates up to App root's examSubmissions.
function ExamTaker({ exam, course, user, onBack, onSubmit }) {
  // answers: { [questionId]: string }
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result,    setResult]    = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const timer = useExamTimer(exam.duration || "1 hour", () => handleSubmit(true));

  const questions = exam.questions || [];
  const answered  = Object.keys(answers).filter(k => answers[k]).length;
  const unanswered = questions.length - answered;

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handleSubmit = (autoSubmit = false) => {
    if (!autoSubmit && unanswered > 0 && !showConfirm) { setShowConfirm(true); return; }
    setShowConfirm(false);

    // ── Auto-grade ──
    let score = 0;
    const questionResults = questions.map(q => {
      const given   = answers[q.id] || "";
      const correct = q.correctAnswer || "";
      let isCorrect = false;
      if (q.type === "Identification") {
        isCorrect = given.trim().toLowerCase() === correct.trim().toLowerCase();
      } else {
        isCorrect = given === correct;
      }
      const pointsAwarded = isCorrect ? q.points : 0;
      score += pointsAwarded;
      return {
        questionId:    q.id,       // UUID for DB-sourced exams
        givenAnswer:   given || null,
        isCorrect,
        pointsAwarded,
      };
    });

    const submission = {
      id:              `SUB-EX-${Date.now()}`,
      examId:          exam.id,
      courseId:        course?.id,
      studentId:       user.id,        // display_id (STU001) — for local state lookups
      studentUuid:     user._uuid,     // UUID — required for DB FK inserts
      answers:         { ...answers },
      questionResults,                 // persisted to exam_question_answers
      score,
      totalPoints:     exam.totalPoints,
      submittedAt:     new Date().toISOString(),
      graded:          true,
    };
    setResult(submission);
    setSubmitted(true);
    onSubmit(submission);   // ← lifts to App root, Teacher sees immediately
  };

  if (submitted && result) {
    return <ResultsSummary exam={exam} answers={answers} submission={result} onBack={onBack} />;
  }

  return (
    <div className="exam-enter" style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ height:46, background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 16px", gap:10, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:12, fontWeight:700, color:"#475569", fontFamily:"inherit" }}
          onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
          onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
          ← Back
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94a3b8", flex:1 }}>
          <span>My Courses</span>
          {course && <><span>›</span><span>{course.code}</span></>}
          <span>›</span>
          <span style={{ color:"#1e293b", fontWeight:700 }}>{exam.title}</span>
        </div>
        <Badge color="warning">In Progress</Badge>
      </div>

      {/* ── Timer + meta strip ── */}
      <div style={{ background:"#1e293b", padding:"10px 22px", display:"flex", alignItems:"center", gap:20, flexShrink:0 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{exam.title}</div>
          <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{exam.totalPoints} pts · {questions.length} question{questions.length!==1?"s":""}</div>
        </div>
        {/* Answered progress */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <div style={{ width:90, height:5, background:"rgba(255,255,255,.1)", borderRadius:3, overflow:"hidden" }}>
            <div style={{ width:`${questions.length>0?(answered/questions.length)*100:0}%`, height:"100%", background:"#6ee7b7", borderRadius:3, transition:"width .3s" }} />
          </div>
          <div style={{ fontSize:10, color:"#64748b" }}>{answered}/{questions.length} answered</div>
        </div>
        {/* Timer */}
        <div style={{ textAlign:"center" }}>
          <div className={`exam-timer${timer.urgent?" urgent":""}`} style={{ color: timer.urgent?"#fca5a5":"#e2e8f0" }}>
            {timer.display}
          </div>
          <div style={{ fontSize:9, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em" }}>Remaining</div>
        </div>
      </div>

      {/* ── Confirm dialog overlay ── */}
      {showConfirm && (
        <div className="modal-overlay" onClick={()=>setShowConfirm(false)}>
          <div className="modal-box" style={{ background:"#fff", borderRadius:12, width:420, padding:"24px", boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ fontWeight:900, fontSize:16, color:"#0f172a", marginBottom:8 }}>Submit Exam?</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:20 }}>
              You have <strong style={{color:"#ef4444"}}>{unanswered} unanswered question{unanswered!==1?"s":""}</strong>. Unanswered questions will receive 0 points.
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={()=>setShowConfirm(false)}>Review Answers</Btn>
              <Btn onClick={()=>handleSubmit(true)}>Submit Anyway</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Questions list (scrollable) ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", background:"#f8fafc" }}>
        <div style={{ maxWidth:760, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>
          {questions.map((q, i) => {
            const ans = answers[q.id] || "";
            return (
              <div key={q.id} style={{ background:"#fff", border:`1.5px solid ${ans?"#c7d2fe":"#e2e8f0"}`, borderRadius:12, padding:"18px 20px", transition:"border-color .2s" }}>
                {/* Question header */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:ans?"#4f46e5":"#f1f5f9", color:ans?"#fff":"#94a3b8", fontSize:13, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#1e293b", lineHeight:1.6, marginBottom:2 }}>{q.questionText}</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:10, fontWeight:800, color:QT_META[q.type]?.color, background:QT_META[q.type]?.bg, padding:"1px 7px", borderRadius:9999 }}>
                        {QT_META[q.type]?.label || q.type}
                      </span>
                      <span style={{ fontSize:10, color:"#94a3b8" }}>{q.points} pt{q.points!==1?"s":""}</span>
                    </div>
                  </div>
                </div>

                {/* ── MCQ ── */}
                {q.type === "MCQ" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, paddingLeft:42 }}>
                    {(q.options||[]).map(opt => (
                      <div key={opt.id}
                        className={`ans-opt${ans===opt.id?" selected":""}`}
                        onClick={() => setAnswer(q.id, opt.id)}>
                        <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${ans===opt.id?"#4f46e5":"#cbd5e1"}`, background:ans===opt.id?"#4f46e5":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {ans===opt.id && <div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:"#475569", minWidth:18 }}>{opt.id}.</span>
                        <span style={{ fontSize:13, color:"#334155" }}>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── True / False ── */}
                {q.type === "TF" && (
                  <div style={{ display:"flex", gap:10, paddingLeft:42 }}>
                    {["True","False"].map(v => (
                      <button key={v}
                        className={`tf-btn${ans===v?" selected-"+v.toLowerCase():""}`}
                        onClick={() => setAnswer(q.id, v)}
                        style={{ flex:1 }}>
                        {v === "True" ? "✓ True" : "✗ False"}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Identification ── */}
                {q.type === "Identification" && (
                  <div style={{ paddingLeft:42 }}>
                    <Input
                      value={ans}
                      onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Type your answer here…"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sticky submit footer ── */}
      <div style={{ height:64, background:"#fff", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 24px", gap:14, flexShrink:0, boxShadow:"0 -4px 16px rgba(0,0,0,.06)" }}>
        <div style={{ flex:1, fontSize:12, color:"#64748b" }}>
          {unanswered > 0
            ? <span><strong style={{color:"#ef4444"}}>{unanswered}</strong> question{unanswered!==1?"s":""} unanswered</span>
            : <span style={{color:"#065f46", fontWeight:700}}>✓ All questions answered</span>
          }
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" onClick={onBack}>Save &amp; Exit</Btn>
          <Btn onClick={() => handleSubmit(false)} style={{ paddingLeft:22, paddingRight:22 }}>
            Submit Exam →
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function StudentCourses({ user, courses, onSubmitExam, examSubmissions, enrollments }) {
  const myEnrollments = enrollments.filter(e => e.studentId===user.id);
  const enrollments_ref = myEnrollments;
  const myCourses   = myEnrollments.map(e => ({ ...courses.find(c=>c.id===e.courseId)||{}, ...e })).filter(c=>c.id);

  // ── Live materials and exams from Supabase ────────────────────────────────
  const [allMaterials, setAllMaterials] = useState([]);
  const [allExams,     setAllExams]     = useState([]);

  useEffect(() => {
    // Build UUID→code map from courses prop (courses have _uuid set in App loadCourses)
    const uuidToCode = {};
    courses.forEach(c => { if (c._uuid) uuidToCode[c._uuid] = c.id; });

    async function loadMaterials() {
      const courseUuids = myCourses.map(c => c._uuid).filter(Boolean);
      if (!courseUuids.length) return;
      const { data } = await supabase
        .from("materials")
        .select("*")
        .in("course_id", courseUuids)
        .eq("is_published", true);
      if (data) setAllMaterials(data.map(r => normalizeMaterial({
        ...r, courses: { course_code: uuidToCode[r.course_id] || r.course_id }
      })));
    }
    async function loadExams() {
      const courseUuids = myCourses.map(c => c._uuid).filter(Boolean);
      if (!courseUuids.length) return;
      const [examRes, qRes] = await Promise.all([
        supabase.from("exams").select("*").in("course_id", courseUuids).eq("is_published", true),
        supabase.from("exam_questions").select("*"),
      ]);
      if (examRes.data) setAllExams(examRes.data.map(r => normalizeExam({
        ...r,
        courses:        { course_code: uuidToCode[r.course_id] || r.course_id },
        exam_questions: (qRes.data || []).filter(q => q.exam_id === r.exam_id),
      })));
    }
    loadMaterials();
    loadExams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments, courses]);

  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("info");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  // ── selectedExam: null = courses view, object = ExamTaker ──
  const [selectedExam, setSelectedExam] = useState(null);

  // ── Work submissions: persisted student file submissions ─────────────────
  const [workSubmissions, setWorkSubmissions] = useState([]);
  useEffect(() => {
    if (!user?._uuid) return;
    supabase.from("work_submissions").select("*").eq("student_id", user._uuid)
      .then(({ data }) => {
        if (data) setWorkSubmissions(data.map(r => normalizeWorkSub(r)));
      });
  }, [user?._uuid]);

  // Realtime: push grade updates to student as soon as teacher saves
  useEffect(() => {
    if (!user?._uuid) return;
    const channel = supabase
      .channel(`student_work_subs:${user._uuid}`)
      .on("postgres_changes", {
        event:  "UPDATE",
        schema: "public",
        table:  "work_submissions",
        filter: `student_id=eq.${user._uuid}`,
      }, (payload) => {
        setWorkSubmissions(prev => prev.map(s =>
          s.materialId === payload.new.material_id
            ? normalizeWorkSub(payload.new)
            : s
        ));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?._uuid]);

  const handleWorkSubmissionSaved = (sub) => {
    setWorkSubmissions(prev => {
      const idx = prev.findIndex(s => s.materialId === sub.materialId);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], ...sub }; return n; }
      return [...prev, sub];
    });
  };

  const courseCols = [
    {field:"code",        header:"Code",     width:80},
    {field:"name",        header:"Course"},
    {field:"teacherName", header:"Teacher",  width:170},
    {field:"schedule",    header:"Schedule", width:155},
    {field:"units",       header:"Units",    width:55},
    {field:"grade",       header:"Grade",    width:80,  cellRenderer:v=>v!=null?<span style={{fontWeight:800,color:gradeColor(v)}}>{v}%</span>:<Badge>TBA</Badge>},
    {field:"status",      header:"Status",   width:90,  cellRenderer:v=><Badge color="success">{v}</Badge>},
  ];

  // ── DefaultCourseView — the existing grid + detail sidebar ─────────────────
  const DefaultCourseView = (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="My Courses" subtitle={`${myCourses.length} enrolled course${myCourses.length!==1?"s":""}`} />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Course grid */}
        <div style={{ flex:1, padding:"14px 18px", display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
          <LMSGrid
            columns={courseCols}
            rowData={myCourses}
            onRowClick={r => { setSel(r); setTab("info"); }}
            selectedId={sel?.id}
            height="100%"
          />
        </div>

        {/* Course detail sidebar */}
        {sel && (
          <div style={{ width:292, borderLeft:"1px solid #e2e8f0", background:"#fff", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
            {/* Sidebar header */}
            <div style={{ padding:"12px 14px", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>{sel.code}: {sel.name}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{sel.schedule}</div>
              </div>
              <button onClick={()=>setSel(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:18, marginLeft:8, lineHeight:1 }}>×</button>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0" }}>
              {["info","materials","exams"].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{ flex:1, padding:"8px 4px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700, color:tab===t?"#4f46e5":"#94a3b8", borderBottom:`2px solid ${tab===t?"#4f46e5":"transparent"}`, textTransform:"capitalize" }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:14 }}>
              {/* ── Info tab ── */}
              {tab==="info" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[["Teacher",sel.teacherName],["Schedule",sel.schedule],["Units",String(sel.units)+" units"],["Year",sel.yearLevel],["Semester",sel.semester],["Current Grade",sel.grade!=null?`${sel.grade}% (${letterGrade(sel.grade)})`:"Pending"]].map(([l,v])=>v&&(
                    <div key={l}>
                      <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
                      <div style={{ fontSize:12, color:"#334155", marginTop:2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Materials tab — items are clickable → sets selectedMaterial ── */}
              {tab==="materials" && (
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {allMaterials.filter(m=>m.courseId===sel.id).length===0
                    ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:"20px 0" }}>No materials yet</div>
                    : allMaterials.filter(m=>m.courseId===sel.id).map(m => {
                        const meta = MAT_META[m.type] || MAT_META[MaterialType.LECTURE];
                        return (
                          // ← Click triggers: selectedMaterial = m → MaterialDetailView renders
                          <div key={m.id} className="mat-item"
                            onClick={() => setSelectedMaterial(m)}
                            style={{ padding:"10px 11px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0", cursor:"pointer" }}
                          >
                            <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                              <span style={{ fontSize:16, marginTop:1, flexShrink:0 }}>{meta.icon}</span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontWeight:700, fontSize:12, color:"#1e293b", marginBottom:3 }}>{m.title}</div>
                                <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>{m.description}</div>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <TypeBadge type={m.type} />
                                  <span style={{ fontSize:10, color:"#94a3b8" }}>{m.date}</span>
                                  {isSubmittable(m.type) && (
                                    <span style={{ fontSize:9, background:"#d1fae5", color:"#065f46", padding:"1px 6px", borderRadius:9999, fontWeight:700 }}>Submit</span>
                                  )}
                                </div>
                              </div>
                              <span style={{ color:"#cbd5e1", fontSize:14, flexShrink:0, marginTop:2 }}>›</span>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              )}

              {/* ── Exams tab ── */}
              {tab==="exams" && (
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {allExams.filter(e=>e.courseId===sel.id).length===0
                    ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:"20px 0" }}>No exams scheduled</div>
                    : allExams.filter(e=>e.courseId===sel.id).map(exam => {
                        const taken = examSubmissions.find(s => s.examId===exam.id && s.studentId===user.id);
                        return (
                          <div key={exam.id} style={{ padding:"10px 11px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0" }}>
                            <div style={{ fontWeight:700, fontSize:12, color:"#1e293b", marginBottom:3 }}>{exam.title}</div>
                            <div style={{ fontSize:11, color:"#64748b" }}>📅 {exam.date} · ⏱ {exam.duration}</div>
                            <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>Total: {exam.totalPoints} pts</div>
                            {taken
                              ? (
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <Badge color={taken.score/taken.totalPoints>=0.75?"success":"danger"}>
                                    {taken.score}/{taken.totalPoints} pts
                                  </Badge>
                                  <span style={{ fontSize:10, color:"#94a3b8" }}>Submitted</span>
                                </div>
                              )
                              : <Btn size="sm" onClick={() => setSelectedExam(exam)}>Take Exam →</Btn>
                            }
                          </div>
                        );
                      })
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Root ternary — three-way priority ────────────────────────────────────
  // ExamTaker > MaterialDetail > DefaultCourseView
  if (selectedExam) {
    return (
      <ExamTaker
        exam={selectedExam}
        course={myCourses.find(c => c.id === selectedExam.courseId)}
        user={user}
        onBack={() => setSelectedExam(null)}
        onSubmit={(sub) => { onSubmitExam(sub); setSelectedExam(null); }}
      />
    );
  }

  return selectedMaterial
    ? <MaterialDetailView
        material={selectedMaterial}
        course={myCourses.find(c => c.id === selectedMaterial.courseId)}
        onBack={() => setSelectedMaterial(null)}
        user={user}
        existingSubmission={workSubmissions.find(s => s.materialId === selectedMaterial.id)}
        onSubmissionSaved={handleWorkSubmissionSaved}
      />
    : DefaultCourseView;
}

function StudentProfile({ user }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({...user});
  const [toast, setToast]     = useState("");

  const save = () => { setEditing(false); setToast("Profile updated!"); setTimeout(()=>setToast(""),2500); };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="My Profile" subtitle="Student · Account Settings"
        actions={<Btn variant={editing?"success":"secondary"} onClick={editing?save:()=>setEditing(true)}>{editing?"✓ Save Changes":"✏ Edit Profile"}</Btn>}
      />
      <div style={{ flex:1, padding:"20px 22px", overflow:"hidden", display:"flex", gap:18 }}>
        {/* Avatar card */}
        <div style={{ width:210, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ textAlign:"center", padding:"22px 16px" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#d1fae5", border:"3px solid #10b981", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:26, fontWeight:900, color:"#065f46" }}>
              {user.fullName?.charAt(0)}
            </div>
            <div style={{ fontWeight:800, fontSize:14, color:"#1e293b", marginBottom:4 }}>{user.fullName}</div>
            <Badge color="success">Student</Badge>
            <div style={{ marginTop:10, fontSize:11, color:"#94a3b8" }}>{user.id}</div>
          </Card>
          <Card>
            <div style={{ fontSize:11, fontWeight:800, color:"#0f172a", marginBottom:8 }}>Academic Info</div>
            {[["Year Level",user.yearLevel],["Semester",user.semester]].map(([l,v])=>v&&(
              <div key={l} style={{ marginBottom:8 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
                <div style={{ fontSize:12, color:"#334155", marginTop:2 }}>{v}</div>
              </div>
            ))}
          </Card>
          {toast && <Toast msg={toast} />}
        </div>
        {/* Edit form */}
        <Card style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:14, color:"#0f172a", marginBottom:16 }}>Personal Information</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[{l:"Full Name",f:"fullName"},{l:"Username",f:"username"},{l:"Email",f:"email"},{l:"Civil Status",f:"civilStatus"},{l:"Birthdate",f:"birthdate",t:"date"}].map(({l,f,t})=>(
              <FF key={f} label={l}>
                {editing
                  ? <Input type={t} value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} />
                  : <div style={{ padding:"8px 10px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0", fontSize:13, color:"#334155", minHeight:35 }}>{user[f]||<span style={{color:"#94a3b8"}}>—</span>}</div>
                }
              </FF>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── StudentGrades ─────────────────────────────────────────────────────────────
// Per-term grade = CW 30% + Class Standing 30% + Exam 40%.
// Drill-down shows the three component breakdowns for each term.
function StudentGrades({ user, courses, examSubmissions, enrollments }) {
  const myEnrollments = enrollments.filter(e => e.studentId === user.id);
  const [expandedId,   setExpandedId]   = useState(null);
  const [allExams,     setAllExams]     = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);  // {material_id, course_id, material_type, term, total_points}
  const [classStandings, setClassStandings] = useState([]); // normalized
  const [workSubs,     setWorkSubs]     = useState([]);  // graded work_submissions for this student

  useEffect(() => {
    async function loadAll() {
      if (!user._uuid) return;
      const uuidToCode = {};
      courses.forEach(c => { if (c._uuid) uuidToCode[c._uuid] = c.id; });
      const courseUuids = myEnrollments.map(e => {
        const c = courses.find(x => x.id === e.courseId);
        return c?._uuid;
      }).filter(Boolean);
      if (!courseUuids.length) return;

      const [examRes, qRes, matRes, csRes, wsRes] = await Promise.all([
        supabase.from("exams").select("*").in("course_id", courseUuids),
        supabase.from("exam_questions").select("*"),
        supabase.from("materials")
          .select("material_id,course_id,material_type,term,total_points")
          .in("course_id", courseUuids),
        supabase.from("class_standing").select("*")
          .eq("student_id", user._uuid).in("course_id", courseUuids),
        supabase.from("work_submissions")
          .select("material_id,score,status")
          .eq("student_id", user._uuid)
          .eq("status", "Graded"),
      ]);

      if (examRes.data) setAllExams(examRes.data.map(r => normalizeExam({
        ...r,
        courses:        { course_code: uuidToCode[r.course_id] || r.course_id },
        exam_questions: (qRes.data || []).filter(q => q.exam_id === r.exam_id),
      })));
      setAllMaterials(matRes.data || []);
      setClassStandings((csRes.data || []).map(r => ({
        courseUuid: r.course_id, term: r.term,
        project: r.project, recitation: r.recitation, attendance: r.attendance,
      })));
      setWorkSubs(wsRes.data || []);
    }
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments, user._uuid]);

  const cellGradeClass = (v) => v == null ? "" : v >= 90 ? "grade-cell-high" : v >= 75 ? "grade-cell-pass" : v >= 60 ? "grade-cell-warn" : "grade-cell-fail";

  // Build one row per enrolled course
  const rows = myEnrollments.map(e => {
    const c    = courses.find(x => x.id === e.courseId) || {};
    const cuuid = c._uuid;

    const termData = {};
    EXAM_TERMS.forEach(term => {
      // ── Course Work (30%) ──────────────────────────────────────────────────
      const cwMats = allMaterials.filter(m =>
        m.course_id === cuuid && m.term === term &&
        (m.material_type === "Lab" || m.material_type === "Assignment")
      );
      const cwSubs = cwMats.map(m => {
        const ws = workSubs.find(w => w.material_id === m.material_id);
        return ws ? ws.score : null;
      }).filter(x => x != null);
      const cw = cwSubs.length > 0
        ? Math.round(cwSubs.reduce((a, b) => a + b, 0) / cwSubs.length)
        : null;
      const cwDetail = cwMats.map(m => ({
        title: m.title || m.material_id,
        score: workSubs.find(w => w.material_id === m.material_id)?.score ?? null,
      }));

      // ── Class Standing (30%) ───────────────────────────────────────────────
      const csEntry = classStandings.find(cs => cs.courseUuid === cuuid && cs.term === term) || null;
      const cs = csGradePct(csEntry);

      // ── Exams (40%) ────────────────────────────────────────────────────────
      const termExams = allExams.filter(ex => ex.courseId === e.courseId && ex.term === term);
      const examSubs  = examSubmissions.filter(s => s.studentId === user.id && s.courseId === e.courseId);
      const examScoresPct = termExams.map(ex => {
        const sub = examSubs.find(s => s.examId === ex.id);
        return sub ? Math.round((sub.score / sub.totalPoints) * 100) : null;
      }).filter(x => x != null);
      const exam = examScoresPct.length > 0
        ? Math.round(examScoresPct.reduce((a, b) => a + b, 0) / examScoresPct.length)
        : null;
      const examDetail = termExams.map(ex => {
        const sub = examSubs.find(s => s.examId === ex.id);
        return { title: ex.title, score: sub?.score ?? null, total: ex.totalPoints,
          pct: sub ? Math.round((sub.score / sub.totalPoints) * 100) : null };
      });

      termData[term] = {
        cw, cwDetail, csEntry,
        cs, exam, examDetail,
        grade: computeTermGrade({ cw, cs, exam }),
      };
    });

    const termGrades = EXAM_TERMS.map(t => termData[t].grade).filter(x => x != null);
    const overall = termGrades.length > 0
      ? Math.round(termGrades.reduce((a, b) => a + b, 0) / termGrades.length)
      : null;

    return {
      courseId: e.courseId, courseCode: c.code, courseName: c.name, teacherName: c.teacherName,
      termData, overall,
      status: overall == null ? "Pending" : overall >= 75 ? "Pass" : "Fail",
    };
  });

  const avg    = rows.filter(r => r.overall != null);
  const gwa    = avg.length ? (avg.reduce((s, r) => s + r.overall, 0) / avg.length).toFixed(1) : "—";
  const passed = rows.filter(r => r.status === "Pass").length;

  const termGradeCell = (v) => v != null
    ? <span className={cellGradeClass(v)} style={{ display:"block", textAlign:"center", fontWeight:800, padding:"2px 6px", borderRadius:5 }}>{v}%</span>
    : <span style={{ color:"#94a3b8", fontSize:11 }}>—</span>;

  const cols = [
    { field:"courseCode",  header:"Code",       width:72 },
    { field:"courseName",  header:"Course Name" },
    { field:"teacherName", header:"Teacher",    width:150 },
    { field:"Prelim",      header:"Prelim",     width:82,  cellRenderer: (_, row) => termGradeCell(row.termData["Prelim"]?.grade) },
    { field:"Midterm",     header:"Midterm",    width:82,  cellRenderer: (_, row) => termGradeCell(row.termData["Midterm"]?.grade) },
    { field:"Semi-Final",  header:"Semi-Final", width:90,  cellRenderer: (_, row) => termGradeCell(row.termData["Semi-Final"]?.grade) },
    { field:"Finals",      header:"Finals",     width:82,  cellRenderer: (_, row) => termGradeCell(row.termData["Finals"]?.grade) },
    { field:"overall",     header:"Overall",    width:82,
      cellRenderer: (_, row) => row.overall != null
        ? <span className={cellGradeClass(row.overall)} style={{ display:"block", textAlign:"center", fontWeight:900, fontSize:14, padding:"2px 6px", borderRadius:5 }}>{row.overall}%</span>
        : <span style={{ color:"#94a3b8", fontSize:11 }}>—</span> },
    { field:"status", header:"Status", width:82,
      cellRenderer: (v) => <Badge color={v==="Pass"?"success":v==="Fail"?"danger":"default"}>{v}</Badge> },
    { field:"courseId", header:"Detail", width:72, sortable:false,
      cellRenderer: (_, row) => (
        <button onClick={e => { e.stopPropagation(); setExpandedId(id => id === row.courseId ? null : row.courseId); }}
          style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:5, padding:"3px 9px", cursor:"pointer", fontSize:11, fontWeight:700, color:"#4f46e5", fontFamily:"inherit" }}>
          {expandedId === row.courseId ? "▲ Hide" : "▼ Details"}
        </button>
      )},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Grade Report" subtitle="Academic Performance Overview · Grade = CW 30% + Class Standing 30% + Exams 40%" />
      <div style={{ flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", overflow:"hidden", gap:14 }}>
        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, flexShrink:0 }}>
          <StatCard icon="📊" label="GWA"        value={gwa+(gwa!=="—"?"%":"")}              color="#4f46e5" bg="#ede9fe" />
          <StatCard icon="📚" label="Courses"    value={rows.length}                          color="#10b981" bg="#d1fae5" />
          <StatCard icon="✅" label="Passing"    value={`${passed}/${rows.length}`}           color="#3b82f6" bg="#dbeafe" />
          <StatCard icon="📝" label="Exams Taken" value={examSubmissions.filter(s=>s.studentId===user.id).length} color="#f59e0b" bg="#fef3c7" />
        </div>

        {/* Grade table */}
        <div style={{ flex:1, overflow:"hidden", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", display:"flex", flexDirection:"column" }}>
          <div style={{ flexShrink:0 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#1e293b" }}>
                  {cols.map(col => (
                    <th key={col.field+col.header} style={{ padding:"9px 12px", textAlign:"left", fontWeight:700, fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", color:"#94a3b8", whiteSpace:"nowrap", width:col.width||"auto" }}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <tbody>
                {rows.map((row, i) => (
                  <React.Fragment key={row.courseId}>
                    <tr style={{ background:i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                      {cols.map(col => (
                        <td key={col.field+col.header} style={{ padding:"9px 12px", verticalAlign:"middle", width:col.width||"auto" }}>
                          {col.cellRenderer ? col.cellRenderer(row[col.field], row) : (row[col.field] ?? "—")}
                        </td>
                      ))}
                    </tr>

                    {/* ── Drill-down: per-term breakdown ── */}
                    {expandedId === row.courseId && (
                      <tr className="drill-row">
                        <td colSpan={cols.length} style={{ padding:"0 12px 16px 28px" }}>
                          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
                            {/* Formula reminder strip */}
                            <div style={{ background:"#1e293b", padding:"8px 16px", display:"flex", gap:20 }}>
                              {[["📚 Course Work","30%","#818cf8"],["🏆 Class Standing","30%","#34d399"],["📝 Exams","40%","#fb923c"]].map(([lbl,pct,col])=>(
                                <div key={lbl} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:col, fontWeight:700 }}>
                                  <span>{lbl}</span>
                                  <span style={{ background:"rgba(255,255,255,.12)", borderRadius:9999, padding:"1px 7px" }}>{pct}</span>
                                </div>
                              ))}
                            </div>

                            {/* Per-term sections */}
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
                              {EXAM_TERMS.map((term, ti) => {
                                const td    = row.termData[term];
                                const tm    = TERM_META[term];
                                const hasCS = td.csEntry && csGradePct(td.csEntry) != null;
                                return (
                                  <div key={term} style={{ padding:"12px 14px", borderRight:ti<3?"1px solid #e2e8f0":"none", borderTop:"1px solid #e2e8f0" }}>
                                    {/* Term badge + computed grade */}
                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                                      <span style={{ fontSize:10, fontWeight:800, color:tm.color, background:tm.bg, padding:"2px 8px", borderRadius:9999 }}>{term}</span>
                                      {td.grade != null
                                        ? <span className={cellGradeClass(td.grade)} style={{ fontSize:15, fontWeight:900, padding:"2px 8px", borderRadius:6 }}>{td.grade}%</span>
                                        : <span style={{ fontSize:11, color:"#94a3b8" }}>Pending</span>}
                                    </div>

                                    {/* Component rows */}
                                    {[
                                      { label:"📚 Course Work", pct:td.cw,   weight:"30%" },
                                      { label:"🏆 Class Standing", pct:td.cs, weight:"30%" },
                                      { label:"📝 Exams",       pct:td.exam, weight:"40%" },
                                    ].map(({ label, pct, weight }) => (
                                      <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                                        <div style={{ fontSize:10, color:"#64748b", fontWeight:600 }}>{label}</div>
                                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                          <span style={{ fontSize:9, color:"#94a3b8" }}>{weight}</span>
                                          {pct != null
                                            ? <span style={{ fontSize:12, fontWeight:800, color:gradeColor(pct) }}>{pct}%</span>
                                            : <span style={{ fontSize:10, color:"#cbd5e1" }}>—</span>}
                                        </div>
                                      </div>
                                    ))}

                                    {/* Class Standing detail */}
                                    {hasCS && (
                                      <div style={{ marginTop:6, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:6, padding:"5px 8px" }}>
                                        {[["Project", td.csEntry?.project],["Recitation", td.csEntry?.recitation],["Attendance", td.csEntry?.attendance]].map(([lbl,v])=>(
                                          <div key={lbl} style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#065f46", marginBottom:2 }}>
                                            <span>{lbl}</span>
                                            <span style={{ fontWeight:700 }}>{v != null ? `${v}/100` : "—"}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Exam list */}
                                    {td.examDetail.length > 0 && (
                                      <div style={{ marginTop:6 }}>
                                        {td.examDetail.map((ex, j) => (
                                          <div key={j} style={{ fontSize:10, color:"#64748b", display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:80 }} title={ex.title}>{ex.title}</span>
                                            <span style={{ fontWeight:700, color:ex.pct!=null?gradeColor(ex.pct):"#94a3b8" }}>
                                              {ex.pct != null ? `${ex.pct}%` : "—"}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:"7px 12px", borderTop:"1px solid #e2e8f0", background:"#f8fafc", fontSize:11, color:"#64748b", flexShrink:0 }}>
            {rows.length} course{rows.length!==1?"s":""} · Click "▼ Details" to see per-term grade breakdown
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user, onLogout, courses, examSubmissions, onSubmitExam, enrollments }) {
  const myEnrollments = enrollments.filter(e => e.studentId===user.id);
  const [page, setPage] = useState("courses");
  const nav = [
    { id:"courses", label:"My Courses",   icon:"📚", badge:myEnrollments.length },
    { id:"profile", label:"My Profile",   icon:"👤", badge:null },
    { id:"grades",  label:"Grade Report", icon:"📊", badge:null },
  ];
  const pages = {
    courses: <StudentCourses user={user} courses={courses} onSubmitExam={onSubmitExam} examSubmissions={examSubmissions} enrollments={enrollments} />,
    profile: <StudentProfile user={user} />,
    grades:  <StudentGrades  user={user} courses={courses} examSubmissions={examSubmissions} enrollments={enrollments} />,
  };
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar navItems={nav} active={page} onNav={setPage} user={user} onLogout={onLogout} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
        {pages[page]}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM BUILDER — TypeScript Interfaces (runtime equivalent)
// ═══════════════════════════════════════════════════════════════════════════════
/*
  TypeScript Interface Output:

  type QuestionType = "MCQ" | "TF" | "Identification";

  interface MCQOption {
    id:    string;   // "A" | "B" | "C" | "D"
    label: string;   // display text
  }

  interface Question {
    id:            string;         // cuid-equivalent
    type:          QuestionType;
    questionText:  string;         // min 3 chars
    points:        number;         // integer, 1–100
    correctAnswer: string;         // For MCQ: option id. For TF: "True"|"False". For ID: keyword.
    options?:      MCQOption[];    // MCQ only — exactly 4 entries
  }

  interface Exam {
    id:          string;
    courseId:    string;
    title:       string;           // min 3 chars
    date:        string;           // ISO date string
    duration:    string;           // e.g. "2 hours"
    totalPoints: number;           // derived: sum of question.points
    questions:   Question[];       // min length 1 (Zod refine)
    createdAt:   string;           // ISO datetime
  }
*/

// ─── Runtime Zod-equivalent Schema (no external dependency) ──────────────────
// Mirrors:
//   z.object({ title: z.string().min(3), questions: z.array(QuestionSchema).min(1),
//               totalPoints: z.number().positive() })
//   .refine(d => d.questions.length > 0, "At least one question required")
//   .refine(d => d.questions.every(q => q.questionText.trim().length >= 3), "All questions need text")
//   .refine(d => d.questions.every(q => q.correctAnswer), "All questions need a correct answer")

const ExamSchema = {
  validate(exam) {
    const errors = [];
    if (!exam.title || exam.title.trim().length < 3)
      errors.push("Exam title must be at least 3 characters.");
    if (!exam.term)
      errors.push("Term is required — select Prelim, Midterm, Semi-Final, or Finals.");
    if (!exam.date)
      errors.push("Exam date is required.");
    if (!exam.questions || exam.questions.length === 0)
      errors.push("Exam must have at least one question.");
    if (exam.questions) {
      exam.questions.forEach((q, i) => {
        if (!q.questionText || q.questionText.trim().length < 3)
          errors.push(`Question ${i+1}: question text is too short (min 3 chars).`);
        if (!q.correctAnswer)
          errors.push(`Question ${i+1}: correct answer is not set.`);
        if (q.type === "MCQ" && q.options?.some(o => !o.label.trim()))
          errors.push(`Question ${i+1}: all MCQ options must have text.`);
        if (!q.points || q.points < 1)
          errors.push(`Question ${i+1}: points must be at least 1.`);
      });
    }
    const totalPoints = (exam.questions||[]).reduce((s,q) => s + (q.points||0), 0);
    if (totalPoints === 0)
      errors.push("Total exam points must be greater than zero.");
    return { ok: errors.length === 0, errors, totalPoints };
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const QT_META = {
  MCQ:            { label:"Multiple Choice", icon:"⊙", color:"#6366f1", bg:"#ede9fe" },
  TF:             { label:"True / False",    icon:"⇌", color:"#10b981", bg:"#d1fae5" },
  Identification: { label:"Identification",  icon:"✎", color:"#f59e0b", bg:"#fef3c7" },
};

const makeId    = () => `q-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const makeOpts  = () => ["A","B","C","D"].map(id => ({ id, label:"" }));
const blankQ    = (type) => ({
  id: makeId(), type,
  questionText: "", points: 5, correctAnswer: "",
  ...(type === "MCQ" ? { options: makeOpts() } : {}),
});

// ─── QuestionItem ─────────────────────────────────────────────────────────────
// Helper component — handles conditional rendering per question type.
// Rendered in three modes:
//   "build"   → full editor (active question)
//   "card"    → collapsed summary card (non-active questions in list)
//   "preview" → read-only student-facing view
function QuestionItem({ q, idx, total, mode, isActive, onSelect, onChange, onDelete, onMove }) {
  const meta = QT_META[q.type] || QT_META.MCQ;

  // ── Preview Mode ──────────────────────────────────────────────────────────
  if (mode === "preview") {
    return (
      <div className="q-card preview" style={{ padding:"16px 18px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"#1e293b", color:"#fff", fontSize:11, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
            {idx+1}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1e293b", lineHeight:1.5, marginBottom:8 }}>{q.questionText || <em style={{color:"#94a3b8"}}>No question text</em>}</div>

            {/* MCQ options */}
            {q.type === "MCQ" && (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {(q.options||[]).map(opt => (
                  <div key={opt.id} className="mcq-option" style={{ cursor:"default" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", border:"2px solid #e2e8f0", flexShrink:0 }} />
                    <span style={{ fontSize:12, fontWeight:700, color:"#475569", marginRight:4 }}>{opt.id}.</span>
                    <span style={{ fontSize:13, color:"#334155" }}>{opt.label || <em style={{color:"#94a3b8"}}>Option {opt.id}</em>}</span>
                  </div>
                ))}
              </div>
            )}

            {/* T/F */}
            {q.type === "TF" && (
              <div style={{ display:"flex", gap:8 }}>
                {["True","False"].map(v => (
                  <div key={v} className="tf-btn" style={{ flex:1, padding:"9px", border:"1.5px solid #e2e8f0", borderRadius:8, textAlign:"center", fontSize:13, fontWeight:700, color:"#94a3b8", background:"#f8fafc" }}>{v}</div>
                ))}
              </div>
            )}

            {/* Identification */}
            {q.type === "Identification" && (
              <div style={{ padding:"9px 13px", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:7, fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>
                Write your answer here…
              </div>
            )}
          </div>
          <div style={{ flexShrink:0, fontSize:11, fontWeight:800, color:meta.color, background:meta.bg, padding:"3px 9px", borderRadius:9999 }}>{q.points} pt{q.points!==1?"s":""}</div>
        </div>
      </div>
    );
  }

  // ── Card Mode (collapsed) ─────────────────────────────────────────────────
  if (mode === "card") {
    return (
      <div className={`q-card${isActive?" active":""}`}
        onClick={onSelect}
        style={{ padding:"11px 13px", marginBottom:8, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:24, height:24, borderRadius:"50%", background: isActive?"#4f46e5":"#f1f5f9", color:isActive?"#fff":"#64748b", fontSize:11, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {idx+1}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#1e293b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {q.questionText.trim() || <em style={{color:"#94a3b8",fontWeight:400}}>Untitled question</em>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:3 }}>
            <span style={{ fontSize:10, fontWeight:800, color:meta.color, background:meta.bg, padding:"1px 6px", borderRadius:9999 }}>{meta.label}</span>
            <span style={{ fontSize:10, color:"#94a3b8" }}>{q.points} pt{q.points!==1?"s":""}</span>
          </div>
        </div>
        {/* Reorder buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:2, flexShrink:0 }}>
          <button onClick={e=>{e.stopPropagation();onMove(-1);}} disabled={idx===0}
            style={{ border:"none", background:"none", cursor:idx===0?"not-allowed":"pointer", color:idx===0?"#e2e8f0":"#94a3b8", fontSize:13, lineHeight:1, padding:2 }}>▲</button>
          <button onClick={e=>{e.stopPropagation();onMove(1);}} disabled={idx===total-1}
            style={{ border:"none", background:"none", cursor:idx===total-1?"not-allowed":"pointer", color:idx===total-1?"#e2e8f0":"#94a3b8", fontSize:13, lineHeight:1, padding:2 }}>▼</button>
        </div>
        <button onClick={e=>{e.stopPropagation();onDelete();}}
          style={{ border:"none", background:"none", cursor:"pointer", color:"#fca5a5", fontSize:15, lineHeight:1, padding:"2px 4px", borderRadius:4, flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
          onMouseLeave={e=>e.currentTarget.style.color="#fca5a5"}>✕</button>
      </div>
    );
  }

  // ── Build Mode (active editor) ────────────────────────────────────────────
  const updField   = (field, val) => onChange({ ...q, [field]: val });
  const updOpt     = (id, label)  => onChange({ ...q, options: q.options.map(o => o.id===id ? {...o,label} : o) });

  return (
    <div className="q-card active exam-builder-enter" style={{ padding:"16px 18px" }}>
      {/* Question type pill + points */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:12, fontWeight:800, color:meta.color, background:meta.bg, padding:"4px 10px", borderRadius:9999, display:"inline-flex", alignItems:"center", gap:5 }}>
          <span>{meta.icon}</span> {meta.label}
        </span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748b" }}>Points:</label>
          <input type="number" min={1} max={100} value={q.points}
            onChange={e => updField("points", Math.max(1,Math.min(100,Number(e.target.value)||1)))}
            style={{ width:56, border:"1.5px solid #e2e8f0", borderRadius:6, padding:"5px 8px", fontSize:13, fontWeight:800, textAlign:"center", fontFamily:"inherit", outline:"none", color:"#4f46e5" }}
            onFocus={e=>e.target.style.borderColor="#6366f1"}
            onBlur={e=>e.target.style.borderColor="#e2e8f0"}
          />
        </div>
      </div>

      {/* Question text */}
      <textarea
        className="edit-textarea"
        rows={2}
        value={q.questionText}
        onChange={e => updField("questionText", e.target.value)}
        placeholder={`Enter question ${idx+1} text…`}
        style={{ marginBottom:12, resize:"vertical" }}
      />

      {/* ── MCQ options ── */}
      {q.type === "MCQ" && (
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Options — click radio to mark correct</div>
          {(q.options||[]).map(opt => (
            <div key={opt.id} className={`mcq-option${q.correctAnswer===opt.id?" correct":""}`}
              style={{ cursor:"default" }}>
              {/* Radio — marks correct answer */}
              <input type="radio" name={`correct-${q.id}`}
                checked={q.correctAnswer === opt.id}
                onChange={() => updField("correctAnswer", opt.id)}
                style={{ accentColor:"#10b981", width:16, height:16, cursor:"pointer", flexShrink:0 }}
              />
              <span style={{ fontSize:12, fontWeight:800, color:"#475569", minWidth:16 }}>{opt.id}.</span>
              <input
                type="text"
                value={opt.label}
                onChange={e => updOpt(opt.id, e.target.value)}
                placeholder={`Option ${opt.id}`}
                style={{ flex:1, border:"none", outline:"none", fontSize:13, fontFamily:"inherit", background:"transparent", color:"#1e293b" }}
              />
              {q.correctAnswer===opt.id && <span style={{fontSize:10,fontWeight:800,color:"#10b981",flexShrink:0}}>✓ Correct</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── True / False ── */}
      {q.type === "TF" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>Correct Answer</div>
          <div style={{ display:"flex", gap:10 }}>
            {["True","False"].map(v => (
              <button key={v}
                className={`tf-btn${q.correctAnswer===v?" selected-"+v.toLowerCase():""}`}
                onClick={() => updField("correctAnswer", v)}>
                {v === "True" ? "✓ True" : "✗ False"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Identification ── */}
      {q.type === "Identification" && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>Answer Key (keyword / exact phrase)</div>
          <Input
            value={q.correctAnswer}
            onChange={e => updField("correctAnswer", e.target.value)}
            placeholder="e.g. Binary Search Tree"
          />
        </div>
      )}
    </div>
  );
}

// ─── ExamPreview ──────────────────────────────────────────────────────────────
// Full-width read-only student-facing exam preview.
function ExamPreview({ exam, onClose }) {
  const totalPts = exam.questions.reduce((s,q) => s+q.points, 0);
  return (
    <div className="mat-detail-enter" style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Preview banner */}
      <div style={{ background:"#0f172a", padding:"10px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <span style={{ fontSize:12, fontWeight:800, color:"#a5f3fc", background:"rgba(165,243,252,.12)", padding:"4px 10px", borderRadius:9999, letterSpacing:"0.04em" }}>👁 STUDENT PREVIEW</span>
        <span style={{ color:"#64748b", fontSize:13, flex:1 }}>This is how the exam will appear to students</span>
        <Btn variant="ghost" size="sm" onClick={onClose} style={{ color:"#a5b4fc", border:"1px solid rgba(165,180,252,.3)" }}>← Back to Builder</Btn>
      </div>

      {/* Exam paper */}
      <div style={{ flex:1, overflowY:"auto", background:"#f1f5f9", padding:"24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto", background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
          {/* Header */}
          <div style={{ background:"#1e293b", padding:"20px 28px" }}>
            <div style={{ fontWeight:900, fontSize:20, color:"#fff", letterSpacing:"-0.02em", marginBottom:4 }}>{exam.title || "Untitled Exam"}</div>
            <div style={{ display:"flex", gap:18, fontSize:12, color:"#94a3b8" }}>
              {exam.date     && <span>📅 {exam.date}</span>}
              {exam.duration && <span>⏱ {exam.duration}</span>}
              <span>📊 {totalPts} total points</span>
              <span>📋 {exam.questions.length} question{exam.questions.length!==1?"s":""}</span>
            </div>
          </div>
          {/* Instruction strip */}
          <div style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0", padding:"9px 28px" }}>
            <span style={{ fontSize:12, color:"#64748b", fontStyle:"italic" }}>Read each item carefully. Write your answers legibly.</span>
          </div>
          {/* Questions */}
          <div style={{ padding:"22px 28px" }}>
            {exam.questions.length === 0
              ? <div style={{ textAlign:"center", color:"#94a3b8", padding:"40px 0", fontSize:14 }}>No questions added yet.</div>
              : exam.questions.map((q, i) => (
                  <QuestionItem key={q.id} q={q} idx={i} total={exam.questions.length} mode="preview" />
                ))
            }
          </div>
          {/* Footer */}
          <div style={{ borderTop:"1px solid #f1f5f9", padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f8fafc" }}>
            <span style={{ fontSize:12, color:"#94a3b8" }}>— End of Exam —</span>
            <span style={{ fontSize:13, fontWeight:800, color:"#4f46e5" }}>Total: {totalPts} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ExamBuilder ──────────────────────────────────────────────────────────────
// Full main-content-area takeover. Triggered by clicking "+ Create Exam".
// Owns all question state. Validates via ExamSchema before saving.
//
// Layout (100vh, no full-page scroll):
//   [Breadcrumb bar — 46px fixed]
//   [Meta row — 54px fixed]
//   [Toolbar row — 46px fixed]
//   [Two-column body — flex:1, each col scrolls independently]
//     Left  330px: Question list (scrollable) + "Add Question" dropdown
//     Right flex:1: Active question editor (scrollable)
function ExamBuilder({ course, initialExam, onSave, onBack }) {
  // ── Exam meta ──
  const [title,    setTitle]    = useState(initialExam?.title    || "");
  const [date,     setDate]     = useState(initialExam?.date     || "");
  const [duration, setDuration] = useState(initialExam?.duration || "");
  const [term,     setTerm]     = useState(initialExam?.term     || "");

  // ── examQuestions — the core array state ──
  // Each item: { id, type, questionText, points, correctAnswer, options? }
  const [examQuestions, setExamQuestions] = useState(initialExam?.questions || []);
  const [activeQId,     setActiveQId]     = useState(null);
  const [showTypeMenu,  setShowTypeMenu]  = useState(false);
  const [previewMode,   setPreviewMode]   = useState(false);
  const [valErrors,     setValErrors]     = useState([]);
  const [saved,         setSaved]         = useState(false);
  const typeMenuRef = useRef(null);

  const activeQ = examQuestions.find(q => q.id === activeQId) || null;
  const totalPts = examQuestions.reduce((s,q) => s+(q.points||0), 0);

  // Close type menu on outside click
  useRef(() => {
    const handler = (e) => { if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) setShowTypeMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  // ── Question CRUD ──
  const addQuestion = (type) => {
    const q = blankQ(type);
    setExamQuestions(prev => [...prev, q]);
    setActiveQId(q.id);
    setShowTypeMenu(false);
    setValErrors([]);
  };

  const updateQuestion = (updated) => {
    setExamQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
  };

  const deleteQuestion = (id) => {
    setExamQuestions(prev => {
      const next = prev.filter(q => q.id !== id);
      if (activeQId === id) setActiveQId(next[next.length-1]?.id || null);
      return next;
    });
  };

  const moveQuestion = (id, dir) => {
    setExamQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  // ── Validation + Save ──
  const handleSave = () => {
    const examData = { title, date, duration, term: term || null, questions: examQuestions,
      totalPoints: totalPts, id:`EX${Date.now()}`, courseId:course.id,
      createdAt: new Date().toISOString() };
    const result = ExamSchema.validate(examData);
    if (!result.ok) { setValErrors(result.errors); return; }
    setValErrors([]);
    setSaved(true);
    setTimeout(() => { onSave(examData); }, 700);
  };

  if (previewMode) {
    return <ExamPreview exam={{ title, date, duration, questions: examQuestions }} onClose={() => setPreviewMode(false)} />;
  }

  return (
    <div className="exam-builder-enter" style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>

      {/* ── Breadcrumb bar ── */}
      <div style={{ height:46, background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 16px", gap:10, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:12, fontWeight:700, color:"#475569", fontFamily:"inherit" }}
          onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
          onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
          ← Back to Courses
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94a3b8", flex:1 }}>
          <span>My Courses</span>
          {course && <><span>›</span><span>{course.code}</span></>}
          <span>›</span>
          <span style={{ color:"#1e293b", fontWeight:700 }}>Exam Builder</span>
        </div>
        <span style={{ fontSize:10, fontWeight:800, color:"#f59e0b", background:"#fef3c7", padding:"3px 9px", borderRadius:9999 }}>
          ✏ Builder Mode
        </span>
      </div>

      {/* ── Exam meta row ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"10px 18px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Exam title…"
          style={{ flex:2, border:"1.5px solid #e2e8f0", borderRadius:7, padding:"7px 11px", fontSize:15, fontWeight:800, fontFamily:"inherit", color:"#0f172a", outline:"none", minWidth:0 }}
          onFocus={e=>e.target.style.borderColor="#6366f1"}
          onBlur={e=>e.target.style.borderColor="#e2e8f0"}
        />
        <div style={{ flex:1, position:"relative", minWidth:0 }}>
          <select value={term} onChange={e=>setTerm(e.target.value)}
            style={{ width:"100%", border:`1.5px solid ${term ? "#e2e8f0" : "#ef4444"}`, borderRadius:7, padding:"7px 11px", fontSize:13, fontFamily:"inherit", color: term ? "#0f172a" : "#94a3b8", outline:"none", background:"#fff", cursor:"pointer", appearance:"auto" }}>
            <option value="" disabled>— Term (required) —</option>
            {EXAM_TERMS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          {!term && <span style={{ position:"absolute", top:-6, right:6, fontSize:10, fontWeight:800, color:"#ef4444", background:"#fff", padding:"0 3px" }}>required</span>}
        </div>
        <Input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ flex:1, minWidth:0 }} />
        <Input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (e.g. 2 hours)" style={{ flex:1, minWidth:0 }} />
        {/* Live point counter */}
        <div style={{ flexShrink:0, textAlign:"center", padding:"5px 14px", background:totalPts>0?"#ede9fe":"#f1f5f9", borderRadius:8, border:"1.5px solid", borderColor:totalPts>0?"#c7d2fe":"#e2e8f0" }}>
          <div style={{ fontSize:18, fontWeight:900, color:totalPts>0?"#4f46e5":"#94a3b8", lineHeight:1 }}>{totalPts}</div>
          <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>Total pts</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0", padding:"8px 18px", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        {/* Add Question dropdown trigger */}
        <div style={{ position:"relative" }} ref={typeMenuRef}>
          <Btn onClick={() => setShowTypeMenu(v=>!v)}>
            <span style={{fontSize:15}}>＋</span> Add Question ▾
          </Btn>
          {showTypeMenu && (
            <div className="qtype-menu">
              {Object.entries(QT_META).map(([type, m]) => (
                <div key={type} className="qtype-item" onClick={() => addQuestion(type)}>
                  <span style={{ width:26, height:26, borderRadius:7, background:m.bg, color:m.color, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>{m.label}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>
                      {type==="MCQ"?"4 choices, one correct":type==="TF"?"True or False toggle":"Keyword answer"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginLeft:"auto", display:"flex", gap:7, alignItems:"center" }}>
          {/* Question count pill */}
          <span style={{ fontSize:11, fontWeight:800, color:"#64748b", background:"#f1f5f9", padding:"4px 10px", borderRadius:9999, border:"1px solid #e2e8f0" }}>
            {examQuestions.length} question{examQuestions.length!==1?"s":""}
          </span>
          {/* Preview */}
          <Btn variant="secondary" onClick={() => { setValErrors([]); setPreviewMode(true); }}>
            👁 Preview
          </Btn>
          {/* Save */}
          {saved
            ? <div style={{ padding:"7px 16px", background:"#d1fae5", borderRadius:6, fontSize:13, fontWeight:800, color:"#065f46", display:"flex", alignItems:"center", gap:5 }}>✓ Saved!</div>
            : <Btn onClick={handleSave}>💾 Save Exam</Btn>
          }
        </div>
      </div>

      {/* ── Validation errors ── */}
      {valErrors.length > 0 && (
        <div style={{ padding:"8px 18px", background:"#fff", borderBottom:"1px solid #fecaca", flexShrink:0 }}>
          {valErrors.map((e,i) => (
            <div key={i} className="val-error" style={{ marginBottom:i<valErrors.length-1?5:0 }}>⚠ {e}</div>
          ))}
        </div>
      )}

      {/* ── Two-column body ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* LEFT — Question list (scrollable) */}
        <div style={{ width:310, borderRight:"1px solid #e2e8f0", display:"flex", flexDirection:"column", overflow:"hidden", background:"#fafafa", flexShrink:0 }}>
          <div style={{ padding:"10px 13px 6px", flexShrink:0 }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>
              Question List
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"0 11px 14px" }}>
            {examQuestions.length === 0
              ? (
                <div style={{ textAlign:"center", padding:"40px 16px", color:"#94a3b8" }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>No questions yet</div>
                  <div style={{ fontSize:12 }}>Click "Add Question" to begin building your exam.</div>
                </div>
              )
              : examQuestions.map((q, i) => (
                  <QuestionItem
                    key={q.id} q={q} idx={i} total={examQuestions.length}
                    mode="card"
                    isActive={q.id === activeQId}
                    onSelect={() => setActiveQId(q.id)}
                    onChange={updateQuestion}
                    onDelete={() => deleteQuestion(q.id)}
                    onMove={(dir) => moveQuestion(q.id, dir)}
                  />
                ))
            }
          </div>
        </div>

        {/* RIGHT — Active question editor (scrollable) */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px", background:"#fff" }}>
          {activeQ
            ? (
              <QuestionItem
                key={activeQ.id}
                q={activeQ}
                idx={examQuestions.findIndex(q=>q.id===activeQ.id)}
                total={examQuestions.length}
                mode="build"
                isActive={true}
                onChange={updateQuestion}
                onDelete={() => deleteQuestion(activeQ.id)}
                onMove={(dir) => moveQuestion(activeQ.id, dir)}
              />
            )
            : (
              <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#94a3b8" }}>
                <div style={{ fontSize:48, marginBottom:14 }}>✏</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#1e293b", marginBottom:6 }}>Question Editor</div>
                <div style={{ fontSize:13, textAlign:"center", maxWidth:320, lineHeight:1.6 }}>
                  Add a question using the button above, or select one from the list on the left to start editing.
                </div>
                <div style={{ marginTop:22, display:"flex", gap:10 }}>
                  {Object.entries(QT_META).map(([type,m]) => (
                    <button key={type} onClick={()=>addQuestion(type)}
                      style={{ padding:"10px 16px", border:`1.5px solid ${m.bg}`, borderRadius:8, background:m.bg, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, color:m.color, display:"flex", alignItems:"center", gap:6 }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER MODULE
// ═══════════════════════════════════════════════════════════════════════════════

// ── GradingModal ─────────────────────────────────────────────────────────────
// Opens when teacher clicks "View & Grade" on a student submission row.
// Displays file metadata, a numeric grade input, and a feedback textarea.
function GradingModal({ submission, onSave, onClose }) {
  const [grade,    setGrade]    = useState(submission.grade    ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saved,    setSaved]    = useState(false);

  const fmtSize = (b) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})
    : "—";

  const handleSave = () => {
    const g = grade === "" ? null : Math.max(0, Math.min(100, Number(grade)));
    onSave({ ...submission, grade: g, feedback: feedback.trim() || null });
    setSaved(true);
    setTimeout(onClose, 900);
  };

  const subStatusColor = {
    Submitted: ["#d1fae5","#065f46"], Late: ["#fee2e2","#991b1b"], Pending: ["#f1f5f9","#475569"], Graded: ["#fef3c7","#92400e"],
  };
  const [sbg, stxt] = subStatusColor[submission.status] || subStatusColor.Pending;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ background:"#fff", borderRadius:14, width:520, maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }}>
        {/* Modal header */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"flex-start", justifyContent:"space-between", background:"#fafafa", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:15, color:"#0f172a", letterSpacing:"-0.02em" }}>Review Submission</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{submission.studentName}</div>
          </div>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:22, lineHeight:1, padding:2 }}
            onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
            onMouseLeave={e=>e.currentTarget.style.color="#94a3b8"}>×</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:16 }}>
          {/* Submission metadata card */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"13px 15px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:26 }}>{submission.fileName?.endsWith(".pdf") ? "📄" : "📝"}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {submission.fileName || "No file submitted"}
                </div>
                {submission.fileSize && <div style={{ fontSize:11, color:"#64748b" }}>{fmtSize(submission.fileSize)}</div>}
              </div>
              <span style={{ background:sbg, color:stxt, padding:"3px 9px", borderRadius:9999, fontSize:11, fontWeight:800 }}>
                {submission.status}
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["Student ID", submission.studentId], ["Submitted At", fmtDate(submission.submittedAt)]].map(([l,v])=>(
                <div key={l}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
                  <div style={{ fontSize:12, color:"#334155", marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* View / Download the submitted file */}
            {submission.fileName && (
              <div style={{ marginTop:10 }}>
                {submission.fileUrl
                  ? (
                    <Btn variant="ghost" size="sm"
                      style={{ border:"1px solid #c7d2fe" }}
                      onClick={() => window.open(submission.fileUrl, "_blank", "noopener,noreferrer")}>
                      👁 View Submitted File
                    </Btn>
                  ) : (
                    <span style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic" }}>
                      ⚠ File recorded (pre-storage) — no URL available
                    </span>
                  )
                }
              </div>
            )}
          </div>

          {/* Grading section */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>Grade Entry</div>

            {/* Grade input */}
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>
                  Score (0–100) <span style={{ color:"#ef4444" }}>*</span>
                </label>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input
                    type="number" min={0} max={100} value={grade}
                    onChange={e => setGrade(e.target.value)}
                    placeholder="—"
                    style={{ width:80, border:"1px solid #e2e8f0", borderRadius:7, padding:"9px 12px", fontSize:20, fontWeight:900, textAlign:"center", color:"#4f46e5", fontFamily:"inherit", outline:"none" }}
                    onFocus={e => e.target.style.borderColor="#6366f1"}
                    onBlur={e  => e.target.style.borderColor="#e2e8f0"}
                  />
                  {grade !== "" && !isNaN(Number(grade)) && (
                    <div style={{ fontSize:22, fontWeight:900, color: gradeColor(Number(grade)) }}>
                      {letterGrade(Number(grade))}
                    </div>
                  )}
                  {grade !== "" && !isNaN(Number(grade)) && (
                    <div style={{ flex:1, height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:`${Math.min(100,Number(grade))}%`, height:"100%", background:gradeColor(Number(grade)), borderRadius:4, transition:"width .3s" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback textarea */}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>
                Feedback / Comments
              </label>
              <textarea
                className="edit-textarea"
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Write feedback for the student (optional)…"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding:"13px 20px", borderTop:"1px solid #e2e8f0", display:"flex", gap:8, justifyContent:"flex-end", background:"#fafafa", flexShrink:0 }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          {saved
            ? <div style={{ padding:"8px 16px", background:"#d1fae5", borderRadius:6, fontSize:13, fontWeight:700, color:"#065f46", display:"flex", alignItems:"center", gap:6 }}>✓ Saved!</div>
            : <Btn onClick={handleSave} disabled={grade === ""}>💾 Save Grade</Btn>
          }
        </div>
      </div>
    </div>
  );
}

// ── TeacherGradingDashboard ───────────────────────────────────────────────────
// Right pane for Lab/Assignment detail. Shows enrolled students, submission
// status, submitted-at date, and a "View & Grade" action per row.
// Uses Supabase Realtime to push new/updated submissions to the teacher live.
function TeacherGradingDashboard({ material, courseId, allUsers, user, gradeEntries, onGradeUpdate, enrollments }) {
  const [roster,       setRoster]     = useState([]);
  const [modalSub,     setModalSub]   = useState(null);
  const [savedToast,   setSavedToast] = useState("");
  const [refreshing,   setRefreshing] = useState(false);
  const [lastUpdated,  setLastUpdated] = useState(null);

  // ── Core roster fetch ───────────────────────────────────────────────────────
  const loadRoster = useRef(null);
  loadRoster.current = async () => {
    setRefreshing(true);
    const { data: subs } = await supabase
      .from("work_submissions")
      .select("*")
      .eq("material_id", material.id);

    const submissionsByUuid = {};
    (subs || []).forEach(r => { submissionsByUuid[r.student_id] = r; });

    const enrolled = (enrollments || []).filter(e => e.courseId === courseId);
    const rows = enrolled.map(e => {
      const userObj = allUsers.find(u => u.id === e.studentId);
      const sub     = submissionsByUuid[userObj?._uuid];
      return sub
        ? { id: sub.submission_id, materialId: material.id,
            studentId:   e.studentId,
            studentName: userObj?.fullName || e.studentId,
            fileName:    sub.file_name,
            fileSize:    sub.file_size_kb ? sub.file_size_kb * 1024 : null,
            fileUrl:     sub.file_url    || null,
            submittedAt: sub.submitted_at,
            status:      sub.status,          // 'Submitted' | 'Late' | 'Graded'
            grade:       sub.score,           // DB column is `score`
            feedback:    sub.feedback }
        : { id: null, materialId: material.id,
            studentId:   e.studentId,
            studentName: userObj?.fullName || e.studentId,
            fileName: null, fileSize: null, submittedAt: null,
            fileUrl: null, status: "Pending", grade: null, feedback: null };
    });
    setRoster(rows);
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  // Initial load + reload whenever material or enrollments change
  useEffect(() => {
    loadRoster.current();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id, enrollments]);

  // ── Supabase Realtime — live push when any student submits/updates ──────────
  useEffect(() => {
    const channel = supabase
      .channel(`work_submissions:material_${material.id}`)
      .on(
        "postgres_changes",
        {
          event:  "*",              // INSERT and UPDATE
          schema: "public",
          table:  "work_submissions",
          filter: `material_id=eq.${material.id}`,
        },
        () => {
          // Re-fetch the full roster whenever any submission row changes
          loadRoster.current();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  // Merge any in-session grade updates back into the roster display
  const displayRoster = roster.map(r => {
    const updated = gradeEntries.find(g => g.studentId === r.studentId && g.materialId === material.id);
    return updated ? { ...r, ...updated } : r;
  });

  const submitted  = displayRoster.filter(r => r.status !== "Pending").length;
  const graded     = displayRoster.filter(r => r.grade  != null).length;
  const pending    = displayRoster.filter(r => r.status === "Pending").length;
  const avgGrade   = graded ? (displayRoster.filter(r=>r.grade!=null).reduce((s,r)=>s+r.grade,0)/graded).toFixed(1) : "—";

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})
    : "—";

  const handleSaveGrade = async (updated) => {
    const g = updated.grade != null ? Number(updated.grade) : null;

    // Write to Supabase
    const { error } = await supabase
      .from("work_submissions")
      .update({
        score:      g,
        feedback:   updated.feedback ?? null,
        status:     g != null ? "Graded" : updated.status,
        graded_by:  user?._uuid ?? null,
        graded_at:  new Date().toISOString(),
      })
      .eq("submission_id", updated.id);

    if (error) {
      setSavedToast(`❌ Save failed: ${error.message}`);
      setTimeout(() => setSavedToast(""), 3500);
      return;
    }

    // Optimistically update local roster (Realtime will also re-sync shortly)
    setRoster(prev => prev.map(r =>
      r.studentId === updated.studentId
        ? { ...updated, grade: g, status: g != null ? "Graded" : updated.status }
        : r
    ));
    onGradeUpdate({ ...updated, grade: g, status: g != null ? "Graded" : updated.status });
    setModalSub(null);
    setSavedToast(`Grade saved for ${updated.studentName}`);
    setTimeout(() => setSavedToast(""), 2500);
  };

  const subColor = { Submitted:"success", Late:"danger", Pending:"default", Graded:"amber" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Section header */}
      <div style={{ padding:"9px 15px", borderBottom:"1px solid #f1f5f9", background:"#fafafe", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>📋 Submissions & Grading</span>
          {/* Live indicator */}
          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:"#10b981" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", display:"inline-block",
              animation:"timerPulse 2s infinite" }} />
            Live
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {savedToast && <span style={{ fontSize:11, fontWeight:700, color:"#065f46", background:"#d1fae5", padding:"3px 8px", borderRadius:5 }}>✓ {savedToast}</span>}
          {lastUpdated && <span style={{ fontSize:10, color:"#94a3b8" }}>Updated {lastUpdated.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</span>}
          <button
            onClick={() => loadRoster.current()}
            disabled={refreshing}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", border:"1px solid #e2e8f0", borderRadius:5, background:"#fff", cursor:refreshing?"not-allowed":"pointer", fontSize:11, fontWeight:700, color:"#4f46e5", fontFamily:"inherit", opacity:refreshing?.6:1 }}>
            {refreshing ? "⟳ Refreshing…" : "⟳ Refresh"}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderBottom:"1px solid #f1f5f9", flexShrink:0 }}>
        {[
          ["Total",     displayRoster.length, "#6366f1"],
          ["Submitted", submitted,             "#10b981"],
          ["Pending",   pending,               "#f59e0b"],
          ["Avg Grade", avgGrade+(avgGrade!=="—"?"%":""), "#3b82f6"],
        ].map(([lbl,val,col])=>(
          <div key={lbl} style={{ padding:"10px 12px", borderRight:"1px solid #f1f5f9", textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:900, color:col }}>{val}</div>
            <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Submissions table */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead style={{ position:"sticky", top:0, zIndex:1 }}>
            <tr style={{ background:"#1e293b" }}>
              {["Student","Status","Submitted At","Grade","Action"].map(h=>(
                <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, fontSize:9, letterSpacing:"0.07em", textTransform:"uppercase", color:"#94a3b8", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRoster.map((row, i) => (
              <tr key={row.studentId} className="sub-row"
                style={{ borderBottom:"1px solid #f1f5f9" }}
              >
                <td style={{ padding:"8px 10px", color:"#1e293b", fontWeight:700 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#6366f1", flexShrink:0 }}>
                      {row.studentName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#1e293b" }}>{row.studentName}</div>
                      <div style={{ fontSize:10, color:"#94a3b8" }}>{row.studentId}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"8px 10px" }}>
                  <Badge color={subColor[row.status]||"default"}>{row.status}</Badge>
                </td>
                <td style={{ padding:"8px 10px", color:"#64748b", fontSize:11 }}>
                  {fmtDate(row.submittedAt)}
                </td>
                <td style={{ padding:"8px 10px" }}>
                  {row.grade != null
                    ? <span style={{ fontWeight:900, fontSize:14, color:gradeColor(row.grade) }}>{row.grade}%</span>
                    : <span style={{ color:"#94a3b8", fontSize:11 }}>—</span>
                  }
                </td>
                <td style={{ padding:"8px 10px" }}>
                  {row.status !== "Pending"
                    ? <Btn size="sm" variant={row.grade!=null?"success":"primary"}
                        onClick={() => setModalSub(row)}>
                        {row.grade != null ? "✏ Edit" : "📝 Grade"}
                      </Btn>
                    : <span style={{ fontSize:11, color:"#cbd5e1" }}>Awaiting</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grading Modal */}
      {modalSub && (
        <GradingModal
          submission={modalSub}
          onSave={handleSaveGrade}
          onClose={() => setModalSub(null)}
        />
      )}
    </div>
  );
}

// ── TeacherLectureDetailView ──────────────────────────────────────────────────
// For Lecture/Reading: toggle between View Mode and Edit Mode.
function TeacherLectureDetailView({ material, onUpdate }) {
  const [editMode,  setEditMode]  = useState(false);
  const [editTitle, setEditTitle] = useState(material.title);
  const [editDesc,  setEditDesc]  = useState(material.description || "");
  const [editContent, setEditContent] = useState(material.content || "");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState("");
  const fileRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Sync local edit-state whenever the material prop changes (e.g. after a save
  // propagates back down from the parent via setSelectedMaterial).
  useEffect(() => {
    setEditTitle(material.title);
    setEditDesc(material.description || "");
    setEditContent(material.content || "");
    setUploadedFile(null);
  }, [material.id, material.attachment_url]);

  // Stage the file — actual bytes uploaded in saveChanges() once we confirm intent to save
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const handleFileUpload = (file) => {
    if (!file) return;
    const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && ![".pdf",".doc",".docx"].some(e=>file.name.toLowerCase().endsWith(e))) {
      showToast("Only PDF and Word files are accepted."); return;
    }
    setPendingAttachment(file);
    setUploadedFile(file);  // keeps UI display in sync
    showToast(`"${file.name}" staged — will upload on Save.`);
  };

  const saveChanges = async () => {
    setSaving(true);
    // Use attachment_name (snake_case) — that is how normalizeMaterial stores it
    let attachmentUrl  = material.attachment_url   || null;
    let attachmentName = material.attachment_name  || null;

    // ── Upload to Supabase Storage if a new file was staged ────────────────────
    if (pendingAttachment instanceof File) {
      const storagePath = `${material.id}/${Date.now()}_${safeFileName(pendingAttachment.name)}`;
      try {
        showToast("Uploading attachment…");
        attachmentUrl  = await uploadFileToStorage("materials", storagePath, pendingAttachment);
        attachmentName = pendingAttachment.name;
      } catch (err) {
        showToast("Upload failed: " + err.message);
        setSaving(false);
        return;
      }
      setPendingAttachment(null);
    }

    const updated = {
      ...material,
      title:           editTitle,
      description:     editDesc,
      content:         editContent,
      attachment_name: attachmentName,   // keep snake_case to match normalizer
      attachmentName:  attachmentName,   // camelCase alias used by handleMaterialUpdate DB write
      attachment_url:  attachmentUrl,
    };
    // Await so the parent's setSelectedMaterial fires before we flip editMode off,
    // ensuring the view mode immediately reflects the saved state.
    await onUpdate(updated);
    setSaving(false);
    setEditMode(false);
    showToast("Material updated successfully!");
  };

  const m = MAT_META[material.type] || MAT_META[MaterialType.LECTURE];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Banner */}
      <div style={{ background:`linear-gradient(135deg,${m.light} 0%,#fff 100%)`, borderBottom:"1px solid #e2e8f0", padding:"13px 22px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:m.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:21, flexShrink:0 }}>{m.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
              <TypeBadge type={material.type} />
              <span style={{ fontSize:11, color:"#94a3b8" }}>{material.date}</span>
            </div>
            <div style={{ fontSize:17, fontWeight:900, color:"#0f172a", letterSpacing:"-0.02em" }}>{material.title}</div>
            {material.description && <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{material.description}</div>}
          </div>
          {/* View / Edit toggle */}
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            {toast && <span style={{ fontSize:11, fontWeight:700, color:"#065f46", background:"#d1fae5", padding:"4px 9px", borderRadius:5, alignSelf:"center" }}>✓ {toast}</span>}
            <Btn variant={editMode ? "danger" : "secondary"} size="sm" onClick={() => { if (!saving) { setEditMode(e=>!e); setToast(""); } }}>
              {editMode ? "✕ Cancel" : "✏ Edit Material"}
            </Btn>
            {editMode && <Btn size="sm" onClick={saveChanges} disabled={saving}>{saving ? "⏳ Saving…" : "💾 Save Changes"}</Btn>}
          </div>
        </div>
      </div>

      {editMode ? (
        /* ── Edit Mode ── */
        <div style={{ flex:1, overflowY:"auto", padding:"18px 24px", display:"flex", flexDirection:"column", gap:14 }}>
          <FF label="Material Title" required>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          </FF>
          <FF label="Description">
            <textarea className="edit-textarea" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Short description shown in the sidebar…" />
          </FF>
          <FF label="Content (Markdown)">
            <textarea className="edit-textarea" rows={12} value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="Write course content using Markdown formatting…" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }} />
          </FF>
          {/* File upload replacement */}
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
              Replace Attachment (PDF / DOCX)
            </label>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
                onChange={e => handleFileUpload(e.target.files?.[0])} />
              <Btn variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>📎 Choose File</Btn>
              {uploadedFile
                ? <span style={{ fontSize:12, color:"#065f46", fontWeight:600 }}>✓ {uploadedFile.name}</span>
                : material.attachment_name
                  ? <span style={{ fontSize:12, color:"#64748b" }}>Current: <strong style={{ color:"#0369a1" }}>{material.attachment_name}</strong></span>
                  : <span style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>No attachment yet</span>
              }
            </div>
          </div>
        </div>
      ) : (
        /* ── View Mode ── */
        <div style={{ flex:1, overflowY:"auto", padding:"20px 26px 28px" }}>
          <div className="md-body">
            {material.content
              ? renderMarkdown(material.content)
              : <p style={{ color:"#94a3b8", fontStyle:"italic" }}>No content yet. Click "Edit Material" to add content.</p>
            }
          </div>
          {/* Attachment preview — mirrors student LectureView */}
          {(material.attachment_url || material.attachment_name) && (
            <div style={{ marginTop:18, padding:"11px 14px", background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>{fileIcon(material.attachment_name)}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#0369a1", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {material.attachment_name || "Attachment"}
                </div>
                <div style={{ fontSize:10, color:"#64748b" }}>Attached file</div>
              </div>
              {material.attachment_url
                ? <Btn variant="ghost" size="sm" style={{ border:"1px solid #7dd3fc" }}
                    onClick={() => window.open(material.attachment_url, "_blank", "noopener,noreferrer")}>
                    ⬇ Download
                  </Btn>
                : <span style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic" }}>Staged — not yet saved</span>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── TeacherAssignmentDetailView ───────────────────────────────────────────────
// Dual-pane: left = instructions (+ edit mode), right = grading dashboard.
function TeacherAssignmentDetailView({ material, courseId, allUsers, user, onUpdate, gradeEntries, onGradeUpdate, enrollments }) {
  const [editMode,    setEditMode]    = useState(false);
  const [editTitle,   setEditTitle]   = useState(material.title);
  const [editContent, setEditContent] = useState(material.content || "");
  const [editDue,     setEditDue]     = useState(material.dueDate || "");
  const [editPoints,  setEditPoints]  = useState(material.points || "");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [toast,       setToast]       = useState("");
  const fileRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Stage the file — actual bytes uploaded in saveChanges()
  const [pendingAttachment, setPendingAttachment] = useState(null);

  // Real file upload — stages the File object; bytes are sent on Save
  const handleFileUpload = (file) => {
    if (!file) return;
    setPendingAttachment(file);
    setUploadedFile(file);
    showToast(`"${file.name}" staged — will upload on Save.`);
  };

  const saveChanges = async () => {
    let attachmentUrl  = material.attachment_url  || null;
    let attachmentName = material.attachmentName  || null;

    // ── Upload to Supabase Storage if a new file was staged ────────────────────
    if (pendingAttachment instanceof File) {
      const storagePath = `${material.id}/${Date.now()}_${safeFileName(pendingAttachment.name)}`;
      try {
        showToast("Uploading attachment…");
        attachmentUrl  = await uploadFileToStorage("materials", storagePath, pendingAttachment);
        attachmentName = pendingAttachment.name;
      } catch (err) {
        showToast("Upload failed: " + err.message);
        return;
      }
      setPendingAttachment(null);
    } else if (uploadedFile) {
      attachmentName = uploadedFile.name;
    }

    onUpdate({ ...material, title:editTitle, content:editContent, dueDate:editDue,
      points:Number(editPoints)||material.points, attachmentName, attachment_url: attachmentUrl });
    setEditMode(false); showToast("Assignment updated!");
  };

  const m = MAT_META[material.type] || MAT_META[MaterialType.ASSIGNMENT];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Banner */}
      <div style={{ background:`linear-gradient(135deg,${m.light} 0%,#fff 100%)`, borderBottom:"1px solid #e2e8f0", padding:"11px 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:m.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{m.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
              <TypeBadge type={material.type} />
              <span style={{ fontSize:11, color:"#94a3b8" }}>{material.date}</span>
              {material.points && <span style={{ fontSize:11, fontWeight:800, color:m.color }}>· {material.points} pts</span>}
              {material.dueDate && <span style={{ fontSize:11, color:"#ef4444", fontWeight:700 }}>· Due {new Date(material.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
            </div>
            <div style={{ fontSize:16, fontWeight:900, color:"#0f172a", letterSpacing:"-0.02em" }}>{material.title}</div>
          </div>
          {/* Edit toggle */}
          <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
            {toast && <span style={{ fontSize:11, fontWeight:700, color:"#065f46", background:"#d1fae5", padding:"3px 8px", borderRadius:5 }}>✓ {toast}</span>}
            <Btn variant={editMode?"danger":"secondary"} size="sm" onClick={()=>{setEditMode(e=>!e);setToast("");}}>
              {editMode ? "✕ Cancel" : "✏ Edit"}
            </Btn>
            {editMode && <Btn size="sm" onClick={saveChanges}>💾 Save</Btn>}
          </div>
        </div>
      </div>

      {/* Dual pane */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* LEFT — instructions / edit form */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", borderRight:"1px solid #e2e8f0" }}>
          <div style={{ padding:"8px 18px", borderBottom:"1px solid #f1f5f9", background:"#fafafa", flexShrink:0 }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>
              {editMode ? "✏ Edit Assignment" : "📋 Instructions & Objectives"}
            </span>
          </div>

          {editMode ? (
            <div style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:12 }}>
              <FF label="Title" required><Input value={editTitle} onChange={e=>setEditTitle(e.target.value)} /></FF>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <FF label="Due Date"><Input type="datetime-local" value={editDue} onChange={e=>setEditDue(e.target.value)} /></FF>
                <FF label="Total Points"><Input type="number" value={editPoints} onChange={e=>setEditPoints(e.target.value)} placeholder="100" /></FF>
              </div>
              <FF label="Instructions (Markdown)">
                <textarea className="edit-textarea" rows={10} value={editContent} onChange={e=>setEditContent(e.target.value)}
                  style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }} />
              </FF>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>
                  Attach Supplementary File
                </label>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
                    onChange={e => handleFileUpload(e.target.files?.[0])} />
                  <Btn variant="secondary" size="sm" onClick={()=>fileRef.current?.click()}>📎 Attach File</Btn>
                  {uploadedFile && <span style={{ fontSize:12, color:"#065f46", fontWeight:600 }}>✓ {uploadedFile.name}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 22px" }}>
              <div className="md-body">
                {material.content
                  ? renderMarkdown(material.content)
                  : <p style={{ color:"#94a3b8", fontStyle:"italic" }}>No instructions yet. Click "Edit" to add content.</p>
                }
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — grading dashboard */}
        <div style={{ width:380, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, background:"#fdfdff" }}>
          <TeacherGradingDashboard
            material={material}
            courseId={courseId}
            allUsers={allUsers}
            user={user}
            gradeEntries={gradeEntries}
            onGradeUpdate={onGradeUpdate}
            enrollments={enrollments}
          />
        </div>
      </div>
    </div>
  );
}

// ── TeacherMaterialDetailView ─────────────────────────────────────────────────
// Root container for teacher material detail.
// Mirrors the student MaterialDetailView structure with breadcrumb + conditional render.
// Ternary: isSubmittable(type) → TeacherAssignmentDetailView : TeacherLectureDetailView
function TeacherMaterialDetailView({ material, course, allUsers, user, onBack, onUpdate, gradeEntries, onGradeUpdate, enrollments }) {
  const showAssignmentLayout = isSubmittable(material.type);

  return (
    <div className="mat-detail-enter" style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Breadcrumb bar — identical structure to student version */}
      <div style={{ height:46, background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 16px", gap:10, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:12, fontWeight:700, color:"#475569", fontFamily:"inherit" }}
          onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
          onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}
        >← Back to Courses</button>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94a3b8", flex:1, minWidth:0 }}>
          <span>My Courses</span>
          {course && <><span>›</span><span>{course.code}</span></>}
          <span>›</span>
          <span style={{ color:"#1e293b", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{material.title}</span>
        </div>
        <TypeBadge type={material.type} />
        {/* Teacher-only: edit affordance hint */}
        <span style={{ fontSize:10, fontWeight:700, color:"#6366f1", background:"#ede9fe", padding:"3px 8px", borderRadius:5 }}>
          ✏ Teacher View
        </span>
      </div>

      {/* Conditional layout — the core ternary */}
      {showAssignmentLayout
        ? <TeacherAssignmentDetailView
            material={material}
            courseId={course?.id}
            allUsers={allUsers}
            user={user}
            onUpdate={onUpdate}
            gradeEntries={gradeEntries}
            onGradeUpdate={onGradeUpdate}
            enrollments={enrollments}
          />
        : <TeacherLectureDetailView
            material={material}
            onUpdate={onUpdate}
          />
      }
    </div>
  );
}

// ── TeacherCourses ────────────────────────────────────────────────────────────
function TeacherCourses({ user, courses, allUsers, enrollments }) {
  const myCourses = courses.filter(c => c.teacher === user.id);

  // Course list state
  const [sel,    setSel]    = useState(null);
  const [tab,    setTab]    = useState("materials");
  const [materials, setMats]= useState([]);
  const [exams,  setExams]  = useState([]);
  const [matF,   setMatF]   = useState({ title:"", type:"Lecture", term:"", description:"" });
  const [exF,    setExF]    = useState({ title:"", date:"", duration:"", totalPoints:"100" });
  const [toast,  setToast]  = useState("");
  const fileRef = useRef(null);

  // ── Load materials and exams from Supabase when teacher's courses load ──
  useEffect(() => {
    async function loadTeacherData() {
      const uuidToCode = {};
      courses.forEach(c => { if (c._uuid) uuidToCode[c._uuid] = c.id; });
      const courseUuids = myCourses.map(c => c._uuid).filter(Boolean);
      if (!courseUuids.length) return;
      const [matRes, examRes, qRes] = await Promise.all([
        supabase.from("materials").select("*").in("course_id", courseUuids),
        supabase.from("exams").select("*").in("course_id", courseUuids),
        supabase.from("exam_questions").select("*"),
      ]);
      if (matRes.data)  setMats(matRes.data.map(r => normalizeMaterial({
        ...r, courses: { course_code: uuidToCode[r.course_id] || r.course_id }
      })));
      if (examRes.data) setExams(examRes.data.map(r => normalizeExam({
        ...r,
        courses:        { course_code: uuidToCode[r.course_id] || r.course_id },
        exam_questions: (qRes.data || []).filter(q => q.exam_id === r.exam_id),
      })));
    }
    loadTeacherData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  // ── selectedMaterial state — null = course list, object = detail view ──
  const [selectedMaterial,  setSelectedMaterial]  = useState(null);
  // ── buildingExam state — null = course list, object = ExamBuilder view ──
  const [buildingExam,      setBuildingExam]       = useState(null);
  // Persists grade entries across detail view mounts within this session
  const [gradeEntries, setGradeEntries] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Holds the actual File object between file-picker selection and addMat() call
  const [pendingFile, setPendingFile] = useState(null);

  // Validate and stage the file — actual upload happens in addMat() once we have the material UUID
  const handleFileUpload = (file) => {
    if (!file) return;
    const allowed = [".pdf",".doc",".docx"];
    if (!allowed.some(ext => file.name.toLowerCase().endsWith(ext))) {
      showToast("Only PDF/DOCX accepted."); return;
    }
    setPendingFile(file);
    setMatF(f => ({ ...f, attachmentName: file.name }));
    showToast(`"${file.name}" staged — will upload when you click Add Material.`);
  };

  const addMat = async () => {
    if (!matF.title.trim() || !sel) return;
    if (!matF.term) { showToast("Please select a term before adding this material."); return; }
    const courseUuid  = sel._uuid;
    const teacherUuid = user._uuid;
    if (!courseUuid)  { showToast("Course UUID missing — reload the page."); return; }
    if (!teacherUuid) { showToast("Teacher UUID missing — reload the page."); return; }

    // Build payload without `term` by default — the column is added via ALTER TABLE
    // in the SQL script, but ALTER runs before DROP TABLE, so it gets wiped on a
    // fresh schema apply. Sending term:null when the column doesn't exist causes a
    // PostgREST 400 "column not found in schema cache". Only include it when set.
    const matPayload = {
      course_id:       courseUuid,
      created_by:      teacherUuid,
      title:           matF.title.trim(),
      material_type:   matF.type,
      description:     matF.description?.trim() || null,
      attachment_name: matF.attachmentName || null,
      is_published:    true,
    };
    if (matF.term) matPayload.term = matF.term;   // only include when non-empty

    const { data: newMat, error } = await supabase
      .from("materials").insert(matPayload).select().single();

    if (error) { showToast("Error saving material: " + error.message); return; }

    // ── Upload staged attachment now that we have the real material UUID ────────
    let attachmentUrl = null;
    if (pendingFile instanceof File) {
      const storagePath = `${courseUuid}/${newMat.material_id}/${Date.now()}_${safeFileName(pendingFile.name)}`;
      try {
        showToast("Uploading attachment…");
        attachmentUrl = await uploadFileToStorage("materials", storagePath, pendingFile);
        // Patch the row we just created with the storage URL
        await supabase.from("materials")
          .update({ attachment_url: attachmentUrl })
          .eq("material_id", newMat.material_id);
      } catch (uploadErr) {
        showToast("Material saved but attachment upload failed: " + uploadErr.message);
      }
      setPendingFile(null);
    }

    // Normalize and add to local state using the real DB row
    setMats(prev => [...prev, normalizeMaterial({
      ...newMat,
      attachment_url: attachmentUrl,
      courses: { course_code: sel.id },
    })]);
    setMatF({ title:"", type:"Lecture", term:"", description:"" });
    showToast("Material added!");
  };

  const addExam = () => {
    if (!exF.title.trim() || !sel) return;
    setExams(prev => [...prev, { id:`EX${Date.now()}`, courseId:sel.id, ...exF }]);
    setExF({ title:"", date:"", duration:"", totalPoints:"100" });
    showToast("Exam created!");
  };

  // Called when teacher saves edits inside the detail view
  const handleMaterialUpdate = async (updated) => {
    // Find the real material_id UUID — normalizeMaterial stores it as `id`
    const { error } = await supabase.from("materials").update({
      title:           updated.title,
      description:     updated.description || null,
      content:         updated.content     || null,
      due_date:        updated.dueDate     || null,
      total_points:    updated.points      || null,
      attachment_name: updated.attachment_name || updated.attachmentName || null,
      attachment_url:  updated.attachment_url || null,  // persist new storage URL
    }).eq("material_id", updated.id);

    if (error) { showToast("Error saving changes: " + error.message); return; }

    setMats(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (selectedMaterial?.id === updated.id) setSelectedMaterial(updated);
  };

  // Merge in-session grading entries
  const handleGradeUpdate = (entry) => {
    setGradeEntries(prev => {
      const exists = prev.findIndex(g => g.studentId === entry.studentId && g.materialId === entry.materialId);
      if (exists >= 0) { const n = [...prev]; n[exists] = entry; return n; }
      return [...prev, entry];
    });
  };

  const cols = [
    {field:"code",      header:"Code",      width:80},
    {field:"name",      header:"Course Name"},
    {field:"schedule",  header:"Schedule",  width:155},
    {field:"units",     header:"Units",     width:55},
    {field:"yearLevel", header:"Year",      width:90},
    {field:"semester",  header:"Semester",  width:110},
    {field:"id",        header:"Students",  width:75,
      cellRenderer:(_,row)=><Badge color="info">{enrollments.filter(e=>e.courseId===row.id).length}</Badge>},
  ];

  // ── DefaultCourseView ─────────────────────────────────────────────────────
  const DefaultCourseView = (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="My Courses" subtitle={`${myCourses.length} assigned course${myCourses.length!==1?"s":""}`} />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Course grid */}
        <div style={{ flex:1, padding:"14px 18px", display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
          <LMSGrid columns={cols} rowData={myCourses}
            onRowClick={c => { setSel(c); setTab("materials"); }}
            selectedId={sel?.id} height="100%"
          />
        </div>

        {/* Course detail sidebar */}
        {sel && (
          <div style={{ width:320, borderLeft:"1px solid #e2e8f0", background:"#fff", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
            {/* Sidebar header */}
            <div style={{ padding:"12px 14px", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>{sel.code}: {sel.name}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{sel.schedule}</div>
              </div>
              <button onClick={()=>setSel(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:18, marginLeft:8 }}>×</button>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0" }}>
              {["materials","exams"].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{ flex:1, padding:"9px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, color:tab===t?"#4f46e5":"#94a3b8", borderBottom:`2px solid ${tab===t?"#4f46e5":"transparent"}`, textTransform:"capitalize" }}>
                  {t==="materials"?"📄 Materials":"📝 Exams"}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
              {toast && <Toast msg={toast} />}

              {/* ── Materials tab ── */}
              {tab==="materials" && (
                <>
                  {/* Add material form */}
                  <div style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>Add Material</div>
                  <Input value={matF.title} onChange={e=>setMatF(f=>({...f,title:e.target.value}))} placeholder="Material title" />
                  <div style={{ display:"flex", gap:8 }}>
                    <Sel value={matF.type} onChange={e=>setMatF(f=>({...f,type:e.target.value}))} style={{ flex:1 }}>
                      {["Lecture","Reading","Lab","Assignment"].map(t=><option key={t}>{t}</option>)}
                    </Sel>
                    <div style={{ flex:1, position:"relative" }}>
                      <Sel value={matF.term} onChange={e=>setMatF(f=>({...f,term:e.target.value}))}
                        style={{ width:"100%", borderColor: matF.term ? "#e2e8f0" : "#ef4444", color: matF.term ? "inherit" : "#94a3b8" }}>
                        <option value="" disabled>— Term (required) —</option>
                        {EXAM_TERMS.map(t=><option key={t}>{t}</option>)}
                      </Sel>
                      {!matF.term && <span style={{ position:"absolute", top:-6, right:6, fontSize:10, fontWeight:800, color:"#ef4444", background:"#fff", padding:"0 3px" }}>required</span>}
                    </div>
                  </div>
                  <textarea value={matF.description} onChange={e=>setMatF(f=>({...f,description:e.target.value}))}
                    className="edit-textarea" rows={2} placeholder="Description (optional)" style={{ resize:"none" }} />
                  {/* File attach */}
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
                      onChange={e=>handleFileUpload(e.target.files?.[0])} />
                    <Btn variant="secondary" size="sm" onClick={()=>fileRef.current?.click()}>📎 Attach</Btn>
                    {matF.attachmentName && <span style={{ fontSize:11, color:"#065f46", fontWeight:600 }}>✓ {matF.attachmentName}</span>}
                  </div>
                  <Btn size="sm" onClick={addMat}>+ Add Material</Btn>

                  {/* Material list — items are clickable → opens TeacherMaterialDetailView */}
                  <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:10, display:"flex", flexDirection:"column", gap:6 }}>
                    {materials.filter(m=>m.courseId===sel.id).length === 0
                      ? <div style={{ color:"#94a3b8", fontSize:12, textAlign:"center", padding:"10px 0" }}>No materials yet</div>
                      : materials.filter(m=>m.courseId===sel.id).map(m=>{
                          const meta = MAT_META[m.type] || MAT_META[MaterialType.LECTURE];
                          return (
                            // ← Click sets selectedMaterial → TeacherMaterialDetailView renders
                            <div key={m.id} className="mat-item"
                              onClick={() => setSelectedMaterial(m)}
                              style={{ padding:"9px 10px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0", cursor:"pointer" }}>
                              <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                                <span style={{ fontSize:14, marginTop:1, flexShrink:0 }}>{meta.icon}</span>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontWeight:700, fontSize:12, color:"#1e293b", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</div>
                                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                    <TypeBadge type={m.type} />
                                    {m.term && (
                                      <span style={{ fontSize:9, background: TERM_META[m.term]?.bg || "#f1f5f9", color: TERM_META[m.term]?.color || "#64748b", padding:"1px 5px", borderRadius:9999, fontWeight:700 }}>{m.term}</span>
                                    )}
                                    <span style={{ fontSize:10, color:"#94a3b8" }}>{m.date}</span>
                                    {isSubmittable(m.type) && (
                                      <span style={{ fontSize:9, background:"#ede9fe", color:"#6366f1", padding:"1px 5px", borderRadius:9999, fontWeight:700 }}>Gradable</span>
                                    )}
                                  </div>
                                </div>
                                <span style={{ color:"#cbd5e1", fontSize:13, flexShrink:0, marginTop:2 }}>›</span>
                              </div>
                            </div>
                          );
                        })
                    }
                  </div>
                </>
              )}

              {/* ── Exams tab ── */}
              {tab==="exams" && (
                <>
                  <div style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>Create Exam</div>
                  <Input value={exF.title} onChange={e=>setExF(f=>({...f,title:e.target.value}))} placeholder="Exam title" />
                  <Input type="date" value={exF.date} onChange={e=>setExF(f=>({...f,date:e.target.value}))} />
                  <Input value={exF.duration} onChange={e=>setExF(f=>({...f,duration:e.target.value}))} placeholder="Duration (e.g. 2 hours)" />
                  <Input type="number" value={exF.totalPoints} onChange={e=>setExF(f=>({...f,totalPoints:e.target.value}))} placeholder="Total points" />

                  {/* ★ Launch ExamBuilder — transitions main content area */}
                  <Btn onClick={() => {
                    if (!exF.title.trim()) { showToast("Enter a title first."); return; }
                    setBuildingExam({ title:exF.title, date:exF.date, duration:exF.duration, questions:[] });
                    setExF({ title:"", date:"", duration:"", totalPoints:"100" });
                  }}>
                    <span style={{fontSize:15}}>✦</span> + Create Exam &amp; Build Questions
                  </Btn>

                  <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:10, display:"flex", flexDirection:"column", gap:6 }}>
                    {exams.filter(e=>e.courseId===sel.id).map(e=>(
                      <div key={e.id} style={{ padding:"9px 11px", background:"#f8fafc", borderRadius:7, border:"1px solid #e2e8f0" }}>
                        <div style={{ fontWeight:800, fontSize:12, color:"#1e293b", marginBottom:3 }}>{e.title}</div>
                        <div style={{ fontSize:10, color:"#64748b" }}>📅 {e.date} · {e.totalPoints} pts · {e.duration}</div>
                        {e.questions?.length > 0 && (
                          <div style={{ marginTop:5, display:"flex", flexWrap:"wrap", gap:4 }}>
                            {Object.entries(
                              e.questions.reduce((acc,q) => ({ ...acc, [q.type]:(acc[q.type]||0)+1 }), {})
                            ).map(([type,count]) => {
                              const m = QT_META[type];
                              return m ? (
                                <span key={type} style={{ fontSize:9, fontWeight:800, color:m.color, background:m.bg, padding:"1px 6px", borderRadius:9999 }}>{count} {type}</span>
                              ) : null;
                            })}
                            <span style={{ fontSize:9, color:"#94a3b8" }}>· {e.questions.length} question{e.questions.length!==1?"s":""}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {exams.filter(e=>e.courseId===sel.id).length===0 && <div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"10px 0"}}>No exams yet</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Root ternary — three-way switch ──────────────────────────────────────
  // Priority: ExamBuilder > MaterialDetail > DefaultCourseView
  if (buildingExam) {
    return (
      <ExamBuilder
        course={myCourses.find(c => c.id === sel?.id) || sel}
        initialExam={buildingExam}
        onBack={() => setBuildingExam(null)}
        onSave={async (savedExam) => {
          const courseUuid  = sel?._uuid;
          const teacherUuid = user._uuid;
          if (!courseUuid || !teacherUuid) {
            showToast("UUID missing — reload the page."); return;
          }

          // Parse duration string (e.g. "2 hours", "90 min") → integer minutes
          const parseDuration = (s) => {
            if (!s) return 60;
            const h = s.match(/(\d+)\s*hour/i);
            const m = s.match(/(\d+)\s*min/i);
            return ((h ? parseInt(h[1]) : 0) * 60) + (m ? parseInt(m[1]) : 0) || 60;
          };

          // 1. Insert exam header row
          // `term` is only included when set — same schema-cache guard as addMat.
          const examPayload = {
            course_id:        courseUuid,
            created_by:       teacherUuid,
            title:            savedExam.title,
            exam_date:        savedExam.date,
            duration_minutes: parseDuration(savedExam.duration),
            total_points:     savedExam.totalPoints,
            instant_feedback: true,
            is_published:     true,
          };
          if (savedExam.term) examPayload.term = savedExam.term;

          const { data: newExam, error: examErr } = await supabase
            .from("exams").insert(examPayload).select().single();

          if (examErr) { showToast("Error saving exam: " + examErr.message); return; }

          // 2. Insert all questions linked to the new exam UUID
          if (savedExam.questions.length > 0) {
            const questionRows = savedExam.questions.map((q, i) => ({
              exam_id:        newExam.exam_id,
              question_type:  q.type,
              question_text:  q.questionText,
              options:        q.type === "MCQ" ? q.options : null,
              correct_answer: q.correctAnswer,
              points:         q.points,
              sort_order:     i,
            }));
            const { error: qErr } = await supabase.from("exam_questions").insert(questionRows);
            if (qErr) { showToast("Exam saved but questions failed: " + qErr.message); return; }
          }

          // 3. Update local state with real DB IDs
          setExams(prev => [...prev, {
            ...savedExam,
            id:       newExam.exam_id,
            courseId: sel.id,
          }]);
          setBuildingExam(null);
          showToast(`"${savedExam.title}" saved with ${savedExam.questions.length} question${savedExam.questions.length !== 1 ? "s" : ""}!`);
        }}
      />
    );
  }

  return selectedMaterial
    ? <TeacherMaterialDetailView
        material={selectedMaterial}
        course={myCourses.find(c => c.id === selectedMaterial.courseId)}
        allUsers={allUsers}
        user={user}
        onBack={() => setSelectedMaterial(null)}
        onUpdate={handleMaterialUpdate}
        gradeEntries={gradeEntries}
        onGradeUpdate={handleGradeUpdate}
        enrollments={enrollments}
      />
    : DefaultCourseView;
}

// ── ClassStandingModal ────────────────────────────────────────────────────────
// Teacher inputs Project / Recitation / Attendance (each /100) per term for
// one student × course combination. Shows auto-computed CS% per term.
function ClassStandingModal({ student, course, existing, teacherUuid, onSave, onClose }) {
  const initVals = () => {
    const s = {};
    EXAM_TERMS.forEach(t => {
      const e = existing.find(x => x.term === t);
      s[t] = { project: e?.project ?? "", recitation: e?.recitation ?? "", attendance: e?.attendance ?? "" };
    });
    return s;
  };
  const [vals,   setVals]   = useState(initVals);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const upd = (term, field, raw) => {
    const v = raw === "" ? "" : Math.max(0, Math.min(100, Number(raw)));
    setVals(p => ({ ...p, [term]: { ...p[term], [field]: v } }));
  };

  const csFor = (term) => {
    const v   = vals[term];
    const arr = [v.project, v.recitation, v.attendance].filter(x => x !== "");
    return arr.length ? Math.round(arr.reduce((a, b) => a + Number(b), 0) / arr.length) : null;
  };

  const handleSave = async () => {
    setSaving(true); setErr("");
    const rows = EXAM_TERMS
      .map(term => {
        const v = vals[term];
        return {
          student_id:  student._uuid,
          course_id:   course._uuid,
          term,
          project:    v.project    !== "" ? Number(v.project)    : null,
          recitation: v.recitation !== "" ? Number(v.recitation) : null,
          attendance: v.attendance !== "" ? Number(v.attendance) : null,
          updated_by: teacherUuid,
          updated_at: new Date().toISOString(),
        };
      })
      .filter(r => r.project != null || r.recitation != null || r.attendance != null);

    if (!rows.length) { setSaving(false); onClose(); return; }

    const { error } = await supabase
      .from("class_standing")
      .upsert(rows, { onConflict: "student_id,course_id,term" });

    setSaving(false);
    if (error) { setErr("Error: " + error.message); return; }

    onSave(rows.map(r => ({
      studentUuid: r.student_id, courseUuid: r.course_id, term: r.term,
      project: r.project, recitation: r.recitation, attendance: r.attendance,
    })));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ background:"#fff", borderRadius:14, width:660, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #e2e8f0", background:"#fafafa", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:15, color:"#0f172a" }}>🏆 Class Standing Grades</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>
              {student.fullName} <span style={{ color:"#94a3b8" }}>·</span> {course.code}: {course.name}
            </div>
          </div>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:22, lineHeight:1 }}
            onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color="#94a3b8"}>×</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
          {/* Formula chip */}
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12 }}>
            <span style={{ fontWeight:800, color:"#065f46" }}>Grade Formula: </span>
            <span style={{ color:"#166534" }}>Course Work <strong>30%</strong> + Class Standing <strong>30%</strong> + Exams <strong>40%</strong></span>
            <div style={{ fontSize:11, color:"#16a34a", marginTop:3 }}>
              Class Standing % = average(Project + Recitation + Attendance) — each scored out of 100
            </div>
          </div>

          {/* Input grid */}
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#1e293b" }}>
                {["Term","Project /100","Recitation /100","Attendance /100","CS Grade"].map(h => (
                  <th key={h} style={{ padding:"9px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXAM_TERMS.map((term, i) => {
                const cs = csFor(term);
                const tm = TERM_META[term];
                return (
                  <tr key={term} style={{ borderBottom:"1px solid #f1f5f9", background:i%2===0?"#fff":"#f8fafc" }}>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ fontSize:11, fontWeight:800, color:tm.color, background:tm.bg, padding:"3px 10px", borderRadius:9999 }}>{term}</span>
                    </td>
                    {["project","recitation","attendance"].map(field => (
                      <td key={field} style={{ padding:"8px 12px" }}>
                        <input type="number" min={0} max={100}
                          value={vals[term][field]}
                          onChange={e => upd(term, field, e.target.value)}
                          placeholder="—"
                          style={{ width:76, border:"1.5px solid #e2e8f0", borderRadius:6, padding:"6px 8px", fontSize:13, fontFamily:"inherit", textAlign:"center", outline:"none" }}
                          onFocus={e  => e.target.style.borderColor="#6366f1"}
                          onBlur={e   => e.target.style.borderColor="#e2e8f0"}
                        />
                      </td>
                    ))}
                    <td style={{ padding:"10px 12px" }}>
                      {cs != null
                        ? <span style={{ fontWeight:900, fontSize:15, color:gradeColor(cs) }}>{cs}%</span>
                        : <span style={{ color:"#94a3b8", fontSize:12 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding:"14px 20px", borderTop:"1px solid #e2e8f0", background:"#fafafa", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          {err ? <span style={{ fontSize:11, color:"#dc2626", fontWeight:700 }}>{err}</span> : <span />}
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "💾 Save Class Standing"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TeacherGrades ─────────────────────────────────────────────────────────────
// Master grade dashboard: per-student × course rows with per-term computed grades.
// Formula: Course Work 30% + Class Standing 30% + Exams 40%.
// "Set CS" opens ClassStandingModal; "View" opens per-term detail modal.
function TeacherGrades({ user, courses, allUsers, examSubmissions, enrollments }) {
  const myCourses = courses.filter(c => c.teacher === user.id);

  const [allExams,       setAllExams]       = useState([]);
  const [allMaterials,   setAllMaterials]   = useState([]);
  const [classStandings, setClassStandings] = useState([]);
  const [allWorkSubs,    setAllWorkSubs]    = useState([]);
  const [filterCourse,   setFilterCourse]   = useState("all");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [csModal,        setCsModal]        = useState(null);  // { student, course }
  const [detailRow,      setDetailRow]      = useState(null);
  const [toast,          setToast]          = useState("");
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    async function loadData() {
      const uuidToCode = {};
      courses.forEach(c => { if (c._uuid) uuidToCode[c._uuid] = c.id; });
      const courseUuids = myCourses.map(c => c._uuid).filter(Boolean);
      if (!courseUuids.length) return;

      const [examRes, qRes, matRes, csRes] = await Promise.all([
        supabase.from("exams").select("*").in("course_id", courseUuids),
        supabase.from("exam_questions").select("*"),
        supabase.from("materials")
          .select("material_id,course_id,material_type,term,total_points,title")
          .in("course_id", courseUuids),
        supabase.from("class_standing").select("*").in("course_id", courseUuids),
      ]);

      if (examRes.data) setAllExams(examRes.data.map(r => normalizeExam({
        ...r,
        courses:        { course_code: uuidToCode[r.course_id] || r.course_id },
        exam_questions: (qRes.data || []).filter(q => q.exam_id === r.exam_id),
      })));

      const matIds = (matRes.data || []).map(m => m.material_id);
      let wsCombined = [];
      if (matIds.length) {
        const { data: wsData } = await supabase
          .from("work_submissions")
          .select("material_id,student_id,score,status")
          .in("material_id", matIds)
          .eq("status", "Graded");
        wsCombined = wsData || [];
      }

      setAllMaterials(matRes.data || []);
      setAllWorkSubs(wsCombined);
      setClassStandings((csRes.data || []).map(r => ({
        studentUuid: r.student_id, courseUuid: r.course_id, term: r.term,
        project: r.project, recitation: r.recitation, attendance: r.attendance,
      })));
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const getTermData = (studentDisplayId, studentUuid, courseId, courseUuid) => {
    const result = {};
    EXAM_TERMS.forEach(term => {
      // Course Work
      const cwMats = allMaterials.filter(m =>
        m.course_id === courseUuid && m.term === term &&
        (m.material_type === "Lab" || m.material_type === "Assignment")
      );
      const cwSubs = cwMats.map(m => {
        const ws = allWorkSubs.find(w => w.material_id === m.material_id && w.student_id === studentUuid);
        return ws ? ws.score : null;
      }).filter(x => x != null);
      const cw = cwSubs.length > 0 ? Math.round(cwSubs.reduce((a,b) => a+b, 0) / cwSubs.length) : null;

      // Class Standing
      const csEntry = classStandings.find(cs =>
        cs.studentUuid === studentUuid && cs.courseUuid === courseUuid && cs.term === term
      ) || null;
      const cs = csGradePct(csEntry);

      // Exams
      const termExams = allExams.filter(ex => ex.courseId === courseId && ex.term === term);
      const subs = examSubmissions.filter(s => s.studentId === studentDisplayId && s.courseId === courseId);
      const examPcts = termExams.map(ex => {
        const sub = subs.find(s => s.examId === ex.id);
        return sub ? Math.round((sub.score / sub.totalPoints) * 100) : null;
      }).filter(x => x != null);
      const exam = examPcts.length > 0 ? Math.round(examPcts.reduce((a,b) => a+b,0) / examPcts.length) : null;

      result[term] = { cw, cs, csEntry, exam, grade: computeTermGrade({ cw, cs, exam }) };
    });
    return result;
  };

  const cellGradeClass = (v) => v == null ? "" : v >= 90 ? "grade-cell-high" : v >= 75 ? "grade-cell-pass" : v >= 60 ? "grade-cell-warn" : "grade-cell-fail";

  // Master rows
  const masterRows = enrollments
    .filter(e => myCourses.some(c => c.id === e.courseId))
    .filter(e => filterCourse === "all" || e.courseId === filterCourse)
    .map(e => {
      const student = allUsers.find(u => u.id === e.studentId) || {};
      const course  = myCourses.find(c => c.id === e.courseId) || {};
      const termData = getTermData(e.studentId, student._uuid, e.courseId, course._uuid);
      const termGrades = EXAM_TERMS.map(t => termData[t].grade).filter(x => x != null);
      const overall = termGrades.length > 0 ? Math.round(termGrades.reduce((a,b) => a+b,0) / termGrades.length) : null;
      return {
        studentId: e.studentId, courseId: e.courseId,
        studentUuid: student._uuid, courseUuid: course._uuid,
        studentName: student.fullName || e.studentId,
        courseCode: course.code || e.courseId, courseName: course.name || "",
        termData, overall,
        status: overall == null ? "Pending" : overall >= 75 ? "Pass" : "Fail",
        _student: student, _course: course,
      };
    })
    .filter(r => filterStatus === "all" || r.status === filterStatus);

  const totalStudents = [...new Set(masterRows.map(r => r.studentId))].length;
  const passCount = masterRows.filter(r => r.status === "Pass").length;
  const failCount = masterRows.filter(r => r.status === "Fail").length;
  const validOveralls = masterRows.filter(r => r.overall != null).map(r => r.overall);
  const classAvg = validOveralls.length
    ? (validOveralls.reduce((a,b) => a+b,0) / validOveralls.length).toFixed(1) : "—";

  const termGradeCell = (row, term) => {
    const g = row.termData[term]?.grade;
    return g != null
      ? <span className={cellGradeClass(g)} style={{ display:"block", textAlign:"center", fontWeight:800, padding:"2px 6px", borderRadius:5, fontSize:12 }}>{g}%</span>
      : <span style={{ color:"#94a3b8", fontSize:11 }}>—</span>;
  };

  const cols = [
    { field:"studentName", header:"Student", width:160,
      cellRenderer:(v,row)=>(
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"#ede9fe", color:"#6366f1", fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{v?.charAt(0)}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:12, color:"#1e293b" }}>{v}</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>{row.studentId}</div>
          </div>
        </div>
      )},
    { field:"courseCode", header:"Course", width:75,
      cellRenderer:(v)=><span style={{ fontWeight:700, color:"#4f46e5" }}>{v}</span> },
    { field:"_prelim",     header:"Prelim",     width:82, cellRenderer:(_,row)=>termGradeCell(row,"Prelim") },
    { field:"_midterm",    header:"Midterm",    width:82, cellRenderer:(_,row)=>termGradeCell(row,"Midterm") },
    { field:"_semifinal",  header:"Semi-Final", width:90, cellRenderer:(_,row)=>termGradeCell(row,"Semi-Final") },
    { field:"_finals",     header:"Finals",     width:82, cellRenderer:(_,row)=>termGradeCell(row,"Finals") },
    { field:"overall", header:"Overall", width:88,
      cellRenderer:(v)=>v!=null
        ? <span className={cellGradeClass(v)} style={{ display:"block", textAlign:"center", fontWeight:900, fontSize:14, padding:"2px 6px", borderRadius:5 }}>{v}%</span>
        : <span style={{ color:"#94a3b8", fontSize:11 }}>—</span> },
    { field:"status", header:"Status", width:80,
      cellRenderer:(v)=><Badge color={v==="Pass"?"success":v==="Fail"?"danger":"default"}>{v}</Badge> },
    { field:"studentId", header:"Actions", width:150, sortable:false,
      cellRenderer:(_,row)=>(
        <div style={{ display:"flex", gap:6 }}>
          <Btn size="sm" variant="secondary"
            onClick={e=>{e.stopPropagation();setCsModal({student:row._student,course:row._course});}}
            style={{ fontSize:11, padding:"3px 9px" }}>
            🏆 Set CS
          </Btn>
          <Btn size="sm" variant="ghost" style={{ border:"1px solid #e2e8f0", fontSize:11, padding:"3px 9px" }}
            onClick={e=>{e.stopPropagation();setDetailRow(row);}}>
            View →
          </Btn>
        </div>
      )},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Grade Students"
        subtitle="Formula: Course Work 30% + Class Standing 30% + Exams 40%"
        actions={
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {toast && <span style={{ fontSize:12, color:"#065f46", fontWeight:700, background:"#d1fae5", padding:"4px 10px", borderRadius:6 }}>✓ {toast}</span>}
            <Sel value={filterCourse} onChange={e=>setFilterCourse(e.target.value)} style={{ width:"auto", fontSize:12 }}>
              <option value="all">All Courses</option>
              {myCourses.map(c=><option key={c.id} value={c.id}>{c.code}</option>)}
            </Sel>
            <Sel value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:"auto", fontSize:12 }}>
              <option value="all">All Status</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </Sel>
          </div>
        }
      />
      <div style={{ flex:1, padding:"14px 20px", display:"flex", flexDirection:"column", overflow:"hidden", gap:12 }}>
        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, flexShrink:0 }}>
          <StatCard icon="👥" label="Students"   value={totalStudents}                       color="#6366f1" bg="#ede9fe" />
          <StatCard icon="📊" label="Class Avg"  value={classAvg+(classAvg!=="—"?"%":"")}   color="#10b981" bg="#d1fae5" />
          <StatCard icon="✅" label="Passing"    value={passCount}                            color="#3b82f6" bg="#dbeafe" />
          <StatCard icon="❌" label="Failing"    value={failCount}                            color="#ef4444" bg="#fee2e2" />
          <StatCard icon="📝" label="Exams"      value={examSubmissions.filter(s=>myCourses.some(c=>c.id===s.courseId)).length} color="#f59e0b" bg="#fef3c7" />
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:16, padding:"6px 10px", background:"#fff", borderRadius:7, border:"1px solid #e2e8f0", flexShrink:0, alignItems:"center" }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>Formula</span>
          {[["📚 Course Work","30%","#ede9fe","#6366f1"],["🏆 Class Standing","30%","#d1fae5","#10b981"],["📝 Exams","40%","#fef3c7","#f59e0b"]].map(([lbl,pct,bg,col])=>(
            <div key={lbl} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11 }}>
              <span style={{ background:bg, color:col, fontWeight:800, padding:"2px 8px", borderRadius:9999 }}>{pct}</span>
              <span style={{ color:"#64748b" }}>{lbl}</span>
            </div>
          ))}
          <span style={{ fontSize:11, color:"#94a3b8", marginLeft:"auto" }}>Click "🏆 Set CS" to enter Project / Recitation / Attendance grades</span>
        </div>

        {/* Grid */}
        <div style={{ flex:1, overflow:"hidden" }}>
          <LMSGrid columns={cols} rowData={masterRows} height="100%"
            onRowClick={row => setDetailRow(row)}
            selectedId={detailRow?.studentId + detailRow?.courseId} />
        </div>
      </div>

      {/* ── Class Standing Modal ── */}
      {csModal && (
        <ClassStandingModal
          student={csModal.student}
          course={csModal.course}
          existing={classStandings.filter(cs =>
            cs.studentUuid === csModal.student._uuid && cs.courseUuid === csModal.course._uuid
          )}
          teacherUuid={user._uuid}
          onSave={(newRows) => {
            setClassStandings(prev => {
              const filtered = prev.filter(cs =>
                !(cs.studentUuid === csModal.student._uuid && cs.courseUuid === csModal.course._uuid &&
                  newRows.some(r => r.term === cs.term))
              );
              return [...filtered, ...newRows];
            });
            showToast(`Class Standing saved for ${csModal.student.fullName}`);
          }}
          onClose={() => setCsModal(null)}
        />
      )}

      {/* ── Student Detail Modal ── */}
      {detailRow && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailRow(null)}>
          <div className="modal-box" style={{ background:"#fff", borderRadius:14, width:680, maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #e2e8f0", background:"#fafafa", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
              <div>
                <div style={{ fontWeight:900, fontSize:15, color:"#0f172a" }}>{detailRow.studentName}</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{detailRow.courseCode} · {detailRow.courseName}</div>
              </div>
              <button onClick={()=>setDetailRow(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:22 }}
                onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                onMouseLeave={e=>e.currentTarget.style.color="#94a3b8"}>×</button>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
              {/* Overall grade summary */}
              <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                <div style={{ flex:1, background:detailRow.status==="Pass"?"#f0fdf4":"#fef2f2", border:`1px solid ${detailRow.status==="Pass"?"#bbf7d0":"#fecaca"}`, borderRadius:10, padding:"14px", textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:900, color:detailRow.status==="Pass"?"#065f46":"#dc2626" }}>{detailRow.overall ?? "—"}{detailRow.overall!=null?"%":""}</div>
                  <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>Overall Grade</div>
                  <Badge color={detailRow.status==="Pass"?"success":detailRow.status==="Fail"?"danger":"default"} style={{marginTop:6,display:"inline-block"}}>{detailRow.status}</Badge>
                </div>
                {/* Per-term overall pills */}
                <div style={{ flex:3, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {EXAM_TERMS.map(term => {
                    const g  = detailRow.termData[term]?.grade;
                    const tm = TERM_META[term];
                    return (
                      <div key={term} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:9, fontWeight:800, color:tm.color, background:tm.bg, padding:"2px 7px", borderRadius:9999, display:"inline-block", marginBottom:6 }}>{term}</div>
                        <div style={{ fontSize:20, fontWeight:900, color:g!=null?gradeColor(g):"#94a3b8" }}>{g!=null?`${g}%`:"—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-term component breakdown */}
              {EXAM_TERMS.map(term => {
                const td = detailRow.termData[term];
                const tm = TERM_META[term];
                return (
                  <div key={term} style={{ marginBottom:14, border:"1px solid #e2e8f0", borderRadius:9, overflow:"hidden" }}>
                    <div style={{ background:"#f8fafc", padding:"8px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e2e8f0" }}>
                      <span style={{ fontSize:11, fontWeight:800, color:tm.color, background:tm.bg, padding:"2px 9px", borderRadius:9999 }}>{term}</span>
                      {td.grade != null
                        ? <span className={cellGradeClass(td.grade)} style={{ fontWeight:900, padding:"3px 10px", borderRadius:6 }}>{td.grade}%</span>
                        : <span style={{ fontSize:11, color:"#94a3b8" }}>Pending</span>}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0 }}>
                      {[
                        { label:"📚 Course Work", pct:td.cw,   weight:"30%", color:"#6366f1", bg:"#ede9fe" },
                        { label:"🏆 Class Standing", pct:td.cs, weight:"30%", color:"#10b981", bg:"#d1fae5" },
                        { label:"📝 Exams",        pct:td.exam, weight:"40%", color:"#f59e0b", bg:"#fef3c7" },
                      ].map(({ label, pct, weight, color, bg }, ci) => (
                        <div key={label} style={{ padding:"10px 14px", borderRight:ci<2?"1px solid #f1f5f9":"none" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                            <span style={{ fontSize:10, fontWeight:700, color:"#64748b" }}>{label}</span>
                            <span style={{ fontSize:9, fontWeight:700, color, background:bg, padding:"1px 6px", borderRadius:9999 }}>{weight}</span>
                          </div>
                          <div style={{ fontSize:20, fontWeight:900, color:pct!=null?gradeColor(pct):"#94a3b8" }}>
                            {pct != null ? `${pct}%` : "—"}
                          </div>
                          {/* Class standing detail */}
                          {label.includes("Class") && td.csEntry && (
                            <div style={{ marginTop:5 }}>
                              {[["Project",td.csEntry.project],["Recitation",td.csEntry.recitation],["Attendance",td.csEntry.attendance]].map(([lbl,v])=>(
                                <div key={lbl} style={{ fontSize:10, color:"#64748b", display:"flex", justifyContent:"space-between" }}>
                                  <span>{lbl}</span><span style={{ fontWeight:700 }}>{v != null ? `${v}/100` : "—"}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding:"12px 20px", borderTop:"1px solid #e2e8f0", background:"#fafafa", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={() => { setDetailRow(null); setCsModal({student:detailRow._student, course:detailRow._course}); }}>
                🏆 Edit Class Standing
              </Btn>
              <Btn variant="secondary" onClick={() => setDetailRow(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function TeacherDashboard({ user, onLogout, courses, allUsers, examSubmissions, enrollments }) {
  const myCourses = courses.filter(c => c.teacher===user.id);
  const [page, setPage] = useState("courses");
  const nav = [
    { id:"courses", label:"My Courses",    icon:"📚", badge:myCourses.length },
    { id:"grades",  label:"Grade Students",icon:"📝", badge:null },
  ];
  const pages = {
    courses: <TeacherCourses user={user} courses={courses} allUsers={allUsers} enrollments={enrollments} />,
    grades:  <TeacherGrades  user={user} courses={courses} allUsers={allUsers} examSubmissions={examSubmissions} enrollments={enrollments} />,
  };
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar navItems={nav} active={page} onNav={setPage} user={user} onLogout={onLogout} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
        {pages[page]}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users,       setUsers]       = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ── Fetch users ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadUsers() {
      const [userRes, stuRes, tchRes] = await Promise.all([
        supabase.from("users").select("*").eq("is_active", true),
        supabase.from("students").select("*"),
        supabase.from("teachers").select("*"),
      ]);
      if (!userRes.data) return;
      const stuMap = {};
      const tchMap = {};
      (stuRes.data || []).forEach(s => { stuMap[s.user_id] = s; });
      (tchRes.data || []).forEach(t => { tchMap[t.user_id] = t; });
      setUsers(userRes.data.map(u => normalizeUser({
        ...u,
        students: stuMap[u.user_id] ? [stuMap[u.user_id]] : [],
        teachers: tchMap[u.user_id] ? [tchMap[u.user_id]] : [],
      })));
    }
    loadUsers();
  }, []);

  // ── Fetch courses (with teacher assignments and schedules) ──────────────────
  useEffect(() => {
    async function loadCourses() {
      const [courseRes, tcaRes, schedRes] = await Promise.all([
        supabase.from("courses").select("*").eq("is_active", true),
        supabase.from("teacher_course_assignments")
          .select("teacher_id, course_id, schedule_id"),
        supabase.from("schedules").select("schedule_id, course_id, schedule_label, year_level, semester"),
      ]);
      const courses   = courseRes.data  || [];
      const tcas      = tcaRes.data     || [];
      const schedules = schedRes.data   || [];

      // Also fetch teacher display info
      const teacherIds = [...new Set(tcas.map(t => t.teacher_id))];
      let teacherMap = {};
      if (teacherIds.length) {
        const { data: tUsers } = await supabase
          .from("users").select("user_id, display_id, full_name").in("user_id", teacherIds);
        (tUsers || []).forEach(u => { teacherMap[u.user_id] = u; });
      }

      setCourses(courses.map(c => {
        const tca = tcas.find(t => t.course_id === c.course_id);
        const sch = schedules.find(s => s.schedule_id === tca?.schedule_id);
        const teacher = tca ? teacherMap[tca.teacher_id] : null;
        return {
          id:          c.course_code,
          code:        c.course_code,
          name:        c.course_name,
          teacher:     teacher?.display_id   || "",
          teacherName: teacher?.full_name    || "Unassigned",
          schedule:    sch?.schedule_label   || "",
          units:       c.units,
          yearLevel:   sch?.year_level       || "",
          semester:    sch?.semester         || "",
          _uuid:       c.course_id,
        };
      }));
    }
    loadCourses();
  }, []);

  // ── Fetch all enrollments ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadEnrollments() {
      const { data } = await supabase
        .from("student_course_assignments")
        .select("student_id, course_id, final_grade, enrollment_status");
      if (!data) return;
      // Resolve student display_id and course_code from already-loaded state
      // We fetch users and courses separately to map UUIDs → display IDs
      const [uRes, cRes] = await Promise.all([
        supabase.from("users").select("user_id, display_id").eq("role", "student"),
        supabase.from("courses").select("course_id, course_code"),
      ]);
      const uMap = {};
      const cMap = {};
      (uRes.data || []).forEach(u => { uMap[u.user_id] = u.display_id; });
      (cRes.data || []).forEach(c => { cMap[c.course_id] = c.course_code; });
      setEnrollments(data.map(row => ({
        studentId: uMap[row.student_id] || row.student_id,
        courseId:  cMap[row.course_id]  || row.course_id,
        grade:     row.final_grade      ?? null,
        status:    row.enrollment_status || "Enrolled",
      })));
    }
    loadEnrollments();
  }, []);

  // ── Global exam submissions — lifted so Teacher sees Student results instantly ──
  const [examSubmissions, setExamSubmissions] = useState([]);

  // Load existing exam submissions from Supabase on mount.
  // Previously this was seeded from INIT_EXAM_SUBMISSIONS=[] so nothing showed
  // on page load — teacher grade view was always empty until a student took an exam
  // in the current session.
  useEffect(() => {
    async function loadExamSubmissions() {
      const { data: subs } = await supabase
        .from("exam_submissions")
        .select("exam_submission_id, exam_id, student_id, score, total_points, submitted_at");
      if (!subs?.length) return;

      // Resolve exam_id → course_code (two hops: exam → course → course_code)
      const examIds  = [...new Set(subs.map(s => s.exam_id))];
      const { data: examRows } = await supabase
        .from("exams").select("exam_id, course_id").in("exam_id", examIds);
      const courseIds = [...new Set((examRows || []).map(e => e.course_id))];
      const { data: courseRows } = await supabase
        .from("courses").select("course_id, course_code").in("course_id", courseIds);

      const courseCodeMap = {};
      (courseRows || []).forEach(c => { courseCodeMap[c.course_id] = c.course_code; });
      const examCourseMap = {};
      (examRows || []).forEach(e => { examCourseMap[e.exam_id] = courseCodeMap[e.course_id] || ""; });

      // Resolve student_id (UUID) → display_id (STU001, …)
      const studentIds = [...new Set(subs.map(s => s.student_id))];
      const { data: userRows } = await supabase
        .from("users").select("user_id, display_id").in("user_id", studentIds);
      const userMap = {};
      (userRows || []).forEach(u => { userMap[u.user_id] = u.display_id; });

      setExamSubmissions(subs.map(s => ({
        id:          s.exam_submission_id,
        examId:      s.exam_id,
        courseId:    examCourseMap[s.exam_id] || "",
        studentId:   userMap[s.student_id]    || s.student_id,
        answers:     {},          // per-question answers not stored in this table
        score:       s.score,
        totalPoints: s.total_points,
        submittedAt: s.submitted_at,
        graded:      true,
      })));
    }
    loadExamSubmissions();
  }, []);
  const handleSubmitExam = async (submission) => {
    // 1. Upsert the exam submission header and get back the DB-assigned ID
    const { data: savedSub, error: subErr } = await supabase
      .from("exam_submissions")
      .upsert({
        exam_id:      submission.examId,
        student_id:   submission.studentUuid,   // UUID — see note below
        score:        submission.score,
        total_points: submission.totalPoints,
      }, { onConflict: "exam_id,student_id" })
      .select("exam_submission_id")
      .single();

    // 2. Write per-question answers (only when exam questions have real DB UUIDs).
    //    For DB-sourced exams the question IDs ARE UUIDs; client-generated exams
    //    (ExamBuilder sessions where onSave was never called) would fail the FK —
    //    we guard with a UUID regex to skip those gracefully.
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const examIdIsUUID = isUUID.test(submission.examId);

    if (!subErr && savedSub && examIdIsUUID && submission.questionResults?.length) {
      const answerRows = submission.questionResults
        .filter(qr => isUUID.test(qr.questionId))   // only persisted questions
        .map(qr => ({
          exam_submission_id: savedSub.exam_submission_id,
          question_id:        qr.questionId,
          given_answer:       qr.givenAnswer  ?? null,
          is_correct:         qr.isCorrect    ?? false,
          points_awarded:     qr.pointsAwarded ?? 0,
        }));
      if (answerRows.length) {
        await supabase.from("exam_question_answers").upsert(
          answerRows,
          { onConflict: "exam_submission_id,question_id" }
        );
      }
    }

    // 3. Merge into local state so Teacher sees it instantly
    setExamSubmissions(prev => {
      const exists = prev.findIndex(s => s.examId === submission.examId && s.studentId === submission.studentId);
      if (exists >= 0) { const n = [...prev]; n[exists] = submission; return n; }
      return [...prev, submission];
    });
  };

  return (
    <>
      <style>{GS}</style>
      {!currentUser
        ? <LoginPage onLogin={setCurrentUser} />
        : currentUser.role==="admin"
          ? <AdminDashboard   user={currentUser} onLogout={()=>setCurrentUser(null)} users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} enrollments={enrollments} setEnrollments={setEnrollments} />
          : currentUser.role==="student"
          ? <StudentDashboard user={currentUser} onLogout={()=>setCurrentUser(null)} courses={courses} examSubmissions={examSubmissions} onSubmitExam={handleSubmitExam} enrollments={enrollments} />
          : <TeacherDashboard user={currentUser} onLogout={()=>setCurrentUser(null)} courses={courses} allUsers={users} examSubmissions={examSubmissions} enrollments={enrollments} />
      }
    </>
  );
}
