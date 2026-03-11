import { useState, useMemo, useRef } from "react";

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
  { id:"EX001", courseId:"CS201",   title:"Midterm Exam",   date:"2025-09-15", duration:"2 hours", totalPoints:100 },
  { id:"EX002", courseId:"MATH201", title:"Quiz 1",         date:"2025-08-20", duration:"1 hour",  totalPoints:50  },
  { id:"EX003", courseId:"CS301",   title:"Practical Test", date:"2025-09-10", duration:"3 hours", totalPoints:100 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const letterGrade = (g) => g >= 93 ? "A" : g >= 90 ? "A-" : g >= 87 ? "B+" : g >= 83 ? "B" : g >= 80 ? "B-" : g >= 77 ? "C+" : g >= 73 ? "C" : g >= 70 ? "C-" : "D";
const gradeColor  = (g) => g >= 90 ? "#10b981" : g >= 75 ? "#f59e0b" : "#ef4444";

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

  const doLogin = (username=u, password=p) => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      const user = INIT_USERS.find(x => x.username===username && x.password===password);
      if (user) onLogin(user); else setErr("Invalid username or password.");
      setLoading(false);
    }, 500);
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

function AdminOverview({ users, courses }) {
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
          <StatCard icon="📋" label="Enrollments"    value={INIT_ENROLLMENTS.length} color="#3b82f6" bg="#dbeafe" />
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

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const prefix  = role==="student" ? "STU" : "TCH";
    const count   = users.filter(u=>u.role===role).length + 1;
    const newUser = { ...form, id:`${prefix}${String(count).padStart(3,"0")}`, role };
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

function AdminCreateCourses({ courses, setCourses, users }) {
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
  const [myEnrolls, setMyEnrolls] = useState(INIT_ENROLLMENTS);

  const addCourse = () => {
    if (!cf.code.trim() || !cf.name.trim()) return;
    const t = teachers.find(x=>x.id===cf.teacher);
    setCourses(prev => [...prev, { ...cf, id:cf.code, teacherName:t?.fullName||"Unassigned" }]);
    setCf(emptyC); showToast("Course created successfully!");
  };

  const assignStudent = () => {
    if (!enroll.studentId || !enroll.courseId) return;
    if (myEnrolls.find(e=>e.studentId===enroll.studentId&&e.courseId===enroll.courseId)) { showToast("Already enrolled!"); return; }
    setMyEnrolls(prev=>[...prev,{...enroll,grade:null,status:"Enrolled"}]);
    setEnroll({studentId:"",courseId:""}); showToast("Student enrolled!");
  };

  const assignTeacher = () => {
    if (!tAssign.teacherId || !tAssign.courseId) return;
    const t = teachers.find(x=>x.id===tAssign.teacherId);
    setCourses(prev=>prev.map(c=>c.id===tAssign.courseId?{...c,teacher:tAssign.teacherId,teacherName:t?.fullName||""}:c));
    setTAssign({teacherId:"",courseId:""}); showToast("Teacher assigned!");
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

function AdminDashboard({ user, onLogout, users, setUsers, courses, setCourses }) {
  const [page, setPage] = useState("overview");
  const nav = [
    { id:"overview",         label:"Overview",         icon:"⬡",  badge:null },
    { id:"create-accounts",  label:"Create Accounts",  icon:"➕",  badge:null },
    { id:"create-courses",   label:"Course Management",icon:"📚", badge:courses.length },
    { id:"view-accounts",    label:"Account Directory", icon:"👥", badge:users.filter(u=>u.role!=="admin").length },
  ];
  const pages = {
    overview:        <AdminOverview       users={users} courses={courses} />,
    "create-accounts": <AdminCreateAccounts users={users} setUsers={setUsers} />,
    "create-courses":  <AdminCreateCourses  courses={courses} setCourses={setCourses} users={users} />,
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
function SubmissionPortal({ material }) {
  const [file,      setFile]      = useState(null);
  const [status,    setStatus]    = useState(SubmissionStatus.NOT_SUBMITTED);
  const [submitted, setSubmitted] = useState(false);
  const [submitAt,  setSubmitAt]  = useState(null);
  const [toast,     setToast]     = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const dueDate   = material.dueDate ? new Date(material.dueDate) : null;
  const isLate    = dueDate && new Date() > dueDate;
  const fmtDate   = (iso) => iso ? new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";

  const submit = () => {
    if (!file) return;
    setSubmitted(true);
    setSubmitAt(new Date().toISOString());
    setStatus(isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);
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
      </div>
    </div>
  );
}

// ── AssignmentView — used for ASSIGNMENT and LAB types (dual-pane) ────────────
function AssignmentView({ material }) {
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
          </div>
        </div>
        {/* RIGHT — submission portal */}
        <div style={{ width:300, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, background:"#fdfdff" }}>
          <div style={{ padding:"8px 15px", borderBottom:"1px solid #f1f5f9", background:"#fafafe", flexShrink:0 }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>📤 Submission Portal</span>
          </div>
          <div style={{ flex:1, padding:"12px 14px", overflow:"hidden" }}>
            <SubmissionPortal material={material} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MaterialDetailView — the main conditional container ───────────────────────
// Implements: selectedMaterial ? <MaterialDetailView /> : <DefaultCourseView />
// Back button sets selectedMaterial → null in the parent (StudentCourses)
function MaterialDetailView({ material, onBack, course }) {
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
        ? <AssignmentView material={material} />
        : <LectureView    material={material} />
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function StudentCourses({ user, courses }) {
  const enrollments = INIT_ENROLLMENTS.filter(e => e.studentId===user.id);
  const myCourses   = enrollments.map(e => ({ ...courses.find(c=>c.id===e.courseId)||{}, ...e })).filter(c=>c.id);

  // ── Course-list state ─────────────────────────────────────────────────────
  const [sel, setSel] = useState(null);       // selected course row
  const [tab, setTab] = useState("info");     // sidebar tab

  // ── Material Detail state ─────────────────────────────────────────────────
  // selectedMaterial: null  →  show DefaultCourseView (the grid + sidebar)
  // selectedMaterial: {...} →  show MaterialDetailView (lecture or assignment)
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
                  {INIT_MATERIALS.filter(m=>m.courseId===sel.id).length===0
                    ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:"20px 0" }}>No materials yet</div>
                    : INIT_MATERIALS.filter(m=>m.courseId===sel.id).map(m => {
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
                  {INIT_EXAMS.filter(e=>e.courseId===sel.id).length===0
                    ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:"20px 0" }}>No exams scheduled</div>
                    : INIT_EXAMS.filter(e=>e.courseId===sel.id).map(e=>(
                      <div key={e.id} style={{ padding:"10px 11px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0" }}>
                        <div style={{ fontWeight:700, fontSize:12, color:"#1e293b", marginBottom:3 }}>{e.title}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>📅 {e.date} · ⏱ {e.duration}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>Total: {e.totalPoints} pts</div>
                        <Btn size="sm" style={{ marginTop:8 }}>Take Exam →</Btn>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Root ternary — the key conditional rendering switch ────────────────────
  // selectedMaterial !== null  →  MaterialDetailView (occupies full content area)
  // selectedMaterial === null  →  DefaultCourseView  (the grid + sidebar)
  return selectedMaterial
    ? <MaterialDetailView
        material={selectedMaterial}
        course={myCourses.find(c => c.id === selectedMaterial.courseId)}
        onBack={() => setSelectedMaterial(null)}   // ← Back sets state back to null
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

function StudentGrades({ user, courses }) {
  const enrollments = INIT_ENROLLMENTS.filter(e => e.studentId===user.id);
  const rows = enrollments.map(e => {
    const c = courses.find(x=>x.id===e.courseId)||{};
    return { ...e, courseCode:c.code, courseName:c.name, teacherName:c.teacherName, units:c.units, letter:e.grade!=null?letterGrade(e.grade):"—" };
  });
  const avg    = rows.length ? (rows.reduce((s,r)=>s+(r.grade||0),0)/rows.length).toFixed(1) : 0;
  const high   = rows.length ? Math.max(...rows.map(r=>r.grade||0)) : 0;
  const passed = rows.filter(r=>r.grade>=75).length;

  const cols = [
    {field:"courseCode",  header:"Code",      width:80},
    {field:"courseName",  header:"Course"},
    {field:"teacherName", header:"Teacher",   width:175},
    {field:"units",       header:"Units",     width:55},
    {field:"grade",       header:"Grade (%)", width:100, cellRenderer:v=>v!=null?<span style={{fontWeight:800,fontSize:14,color:gradeColor(v)}}>{v}%</span>:<Badge>Pending</Badge>},
    {field:"letter",      header:"Letter",    width:70,  cellRenderer:(v,r)=>v!=="—"?<Badge color={r.grade>=80?"success":r.grade>=70?"warning":"danger"}>{v}</Badge>:<Badge>—</Badge>},
    {field:"status",      header:"Status",    width:90,  cellRenderer:v=><Badge color="success">{v}</Badge>},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Grade Report" subtitle="Academic Performance Overview" />
      <div style={{ flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", overflow:"hidden", gap:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, flexShrink:0 }}>
          <StatCard icon="📊" label="Average Grade"  value={avg+"%"}    color="#4f46e5" bg="#ede9fe" />
          <StatCard icon="📚" label="Courses"         value={rows.length} color="#10b981" bg="#d1fae5" />
          <StatCard icon="⭐" label="Highest Grade"   value={high+"%"}   color="#f59e0b" bg="#fef3c7" />
          <StatCard icon="✅" label="Passing Courses" value={passed}     color="#3b82f6" bg="#dbeafe" />
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <LMSGrid columns={cols} rowData={rows} height="100%" />
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user, onLogout, courses }) {
  const enrollments = INIT_ENROLLMENTS.filter(e => e.studentId===user.id);
  const [page, setPage] = useState("courses");
  const nav = [
    { id:"courses", label:"My Courses",   icon:"📚", badge:enrollments.length },
    { id:"profile", label:"My Profile",   icon:"👤", badge:null },
    { id:"grades",  label:"Grade Report", icon:"📊", badge:null },
  ];
  const pages = {
    courses: <StudentCourses user={user} courses={courses} />,
    profile: <StudentProfile user={user} />,
    grades:  <StudentGrades  user={user} courses={courses} />,
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
// TEACHER MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function TeacherCourses({ user, courses }) {
  const myCourses = courses.filter(c => c.teacher===user.id);
  const [sel, setSel]         = useState(null);
  const [tab, setTab]         = useState("materials");
  const [materials, setMats]  = useState(INIT_MATERIALS);
  const [exams, setExams]     = useState(INIT_EXAMS);
  const [matF, setMatF]       = useState({ title:"", type:"Lecture", description:"" });
  const [exF, setExF]         = useState({ title:"", date:"", duration:"", totalPoints:"100" });
  const [toast, setToast]     = useState("");
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(""),2500); };

  const addMat = () => {
    if (!matF.title.trim() || !sel) return;
    setMats(prev=>[...prev,{id:`MAT${Date.now()}`,courseId:sel.id,...matF,date:new Date().toISOString().slice(0,10)}]);
    setMatF({title:"",type:"Lecture",description:""}); showToast("Material added!");
  };
  const addExam = () => {
    if (!exF.title.trim() || !sel) return;
    setExams(prev=>[...prev,{id:`EX${Date.now()}`,courseId:sel.id,...exF}]);
    setExF({title:"",date:"",duration:"",totalPoints:"100"}); showToast("Exam created!");
  };

  const cols = [
    {field:"code",        header:"Code",     width:80},
    {field:"name",        header:"Course Name"},
    {field:"schedule",    header:"Schedule", width:155},
    {field:"units",       header:"Units",    width:55},
    {field:"yearLevel",   header:"Year",     width:90},
    {field:"semester",    header:"Semester", width:110},
    {field:"id",          header:"Students", width:75, cellRenderer:(_,row)=><Badge color="info">{INIT_ENROLLMENTS.filter(e=>e.courseId===row.id).length}</Badge>},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="My Courses" subtitle={`${myCourses.length} assigned course${myCourses.length!==1?"s":""}`} />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <div style={{ flex:1, padding:"14px 18px", display:"flex", flexDirection:"column", overflow:"hidden", background:"#f8fafc" }}>
          <LMSGrid columns={cols} rowData={myCourses} onRowClick={c=>{setSel(c);setTab("materials");}} selectedId={sel?.id} height="100%" />
        </div>
        {sel && (
          <div style={{ width:310, borderLeft:"1px solid #e2e8f0", background:"#fff", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
            <div style={{ padding:"12px 14px", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>{sel.code}: {sel.name}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{sel.schedule}</div>
              </div>
              <button onClick={()=>setSel(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:18, marginLeft:8 }}>×</button>
            </div>
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
              {tab==="materials" && (
                <>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Add Material</div>
                  <Input value={matF.title} onChange={e=>setMatF(f=>({...f,title:e.target.value}))} placeholder="Material title" />
                  <Sel value={matF.type} onChange={e=>setMatF(f=>({...f,type:e.target.value}))}>{["Lecture","Lab","Assignment","Reading"].map(t=><option key={t}>{t}</option>)}</Sel>
                  <textarea value={matF.description} onChange={e=>setMatF(f=>({...f,description:e.target.value}))} placeholder="Description (optional)" rows={2} style={{ border:"1px solid #e2e8f0", borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"inherit", resize:"none", outline:"none", width:"100%" }} />
                  <Btn size="sm" onClick={addMat}>+ Add Material</Btn>
                  <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:10 }}>
                    {materials.filter(m=>m.courseId===sel.id).map(m=>(
                      <div key={m.id} style={{ padding:"8px 10px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0", marginBottom:6 }}>
                        <div style={{ fontWeight:700, fontSize:12, color:"#1e293b" }}>{m.title}</div>
                        <div style={{ fontSize:10, color:"#64748b", marginTop:3 }}>{m.date} · <Badge>{m.type}</Badge></div>
                      </div>
                    ))}
                    {materials.filter(m=>m.courseId===sel.id).length===0&&<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"12px 0"}}>No materials yet</div>}
                  </div>
                </>
              )}
              {tab==="exams" && (
                <>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Create Exam</div>
                  <Input value={exF.title} onChange={e=>setExF(f=>({...f,title:e.target.value}))} placeholder="Exam title" />
                  <Input type="date" value={exF.date} onChange={e=>setExF(f=>({...f,date:e.target.value}))} />
                  <Input value={exF.duration} onChange={e=>setExF(f=>({...f,duration:e.target.value}))} placeholder="Duration (e.g. 2 hours)" />
                  <Input type="number" value={exF.totalPoints} onChange={e=>setExF(f=>({...f,totalPoints:e.target.value}))} placeholder="Total points" />
                  <Btn size="sm" onClick={addExam}>+ Create Exam</Btn>
                  <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:10 }}>
                    {exams.filter(e=>e.courseId===sel.id).map(e=>(
                      <div key={e.id} style={{ padding:"8px 10px", background:"#f8fafc", borderRadius:6, border:"1px solid #e2e8f0", marginBottom:6 }}>
                        <div style={{ fontWeight:700, fontSize:12, color:"#1e293b" }}>{e.title}</div>
                        <div style={{ fontSize:10, color:"#64748b", marginTop:3 }}>📅 {e.date} · {e.totalPoints} pts · {e.duration}</div>
                      </div>
                    ))}
                    {exams.filter(e=>e.courseId===sel.id).length===0&&<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"12px 0"}}>No exams yet</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherGrades({ user, courses, allUsers }) {
  const myCourses   = courses.filter(c => c.teacher===user.id);
  const [courseId, setCourseId] = useState(myCourses[0]?.id||"");
  const [grades, setGrades]     = useState(INIT_ENROLLMENTS);
  const [toast, setToast]       = useState("");

  const courseStudents = grades.filter(e => e.courseId===courseId).map(e => ({
    ...e,
    studentName: allUsers.find(u=>u.id===e.studentId)?.fullName || e.studentId,
  }));

  const updateGrade = (studentId, val) => {
    const n = Math.max(0, Math.min(100, Number(val)));
    setGrades(prev => prev.map(e => e.studentId===studentId && e.courseId===courseId ? {...e, grade:n} : e));
  };

  const saveAll = () => { setToast("Grades saved!"); setTimeout(()=>setToast(""),2500); };

  const avg  = courseStudents.length ? (courseStudents.reduce((s,r)=>s+(r.grade||0),0)/courseStudents.length).toFixed(1) : 0;
  const high = courseStudents.length ? Math.max(...courseStudents.map(r=>r.grade||0)) : 0;
  const pass = courseStudents.filter(r=>r.grade>=75).length;

  const cols = [
    {field:"studentId",   header:"ID",          width:90},
    {field:"studentName", header:"Student Name", width:170},
    {field:"status",      header:"Status",       width:90, cellRenderer:v=><Badge color="success">{v}</Badge>},
    {field:"grade",       header:"Grade (%)",    width:130, cellRenderer:(v,row)=>(
      <input type="number" defaultValue={v??""} min={0} max={100} onChange={e=>updateGrade(row.studentId,e.target.value)}
        style={{ width:62, border:"1px solid #e2e8f0", borderRadius:5, padding:"4px 6px", fontSize:13, fontFamily:"inherit", textAlign:"center", outline:"none" }}
        onFocus={e=>e.target.style.borderColor="#6366f1"}
        onBlur={e=>e.target.style.borderColor="#e2e8f0"}
      />
    )},
    {field:"grade",       header:"Letter",       width:70, cellRenderer:v=>v!=null?<Badge color={v>=80?"success":v>=70?"warning":"danger"}>{letterGrade(v)}</Badge>:<Badge>—</Badge>},
    {field:"grade",       header:"Performance",  cellRenderer:v=>(
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        <div style={{ flex:1, height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${v||0}%`, height:"100%", background:gradeColor(v||0), borderRadius:3 }} />
        </div>
        <span style={{ fontSize:11, color:"#64748b", minWidth:34 }}>{v??0}%</span>
      </div>
    )},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <TopBar title="Grade Students" subtitle="View and edit student marks"
        actions={
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {toast && <span style={{ fontSize:12, color:"#065f46", fontWeight:700, background:"#d1fae5", padding:"4px 10px", borderRadius:6 }}>✓ {toast}</span>}
            <Sel value={courseId} onChange={e=>setCourseId(e.target.value)} style={{ width:"auto" }}>
              {myCourses.map(c=><option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
            </Sel>
            <Btn onClick={saveAll}>💾 Save Grades</Btn>
          </div>
        }
      />
      <div style={{ flex:1, padding:"14px 20px", display:"flex", flexDirection:"column", overflow:"hidden", gap:12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, flexShrink:0 }}>
          <StatCard icon="👥" label="Students"      value={courseStudents.length} color="#6366f1" bg="#ede9fe" />
          <StatCard icon="📊" label="Class Average" value={avg+"%"}               color="#10b981" bg="#d1fae5" />
          <StatCard icon="🏆" label="Highest Grade" value={high+"%"}              color="#f59e0b" bg="#fef3c7" />
          <StatCard icon="✅" label="Passing"        value={`${pass}/${courseStudents.length}`} color="#3b82f6" bg="#dbeafe" />
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <LMSGrid columns={cols} rowData={courseStudents} height="100%" />
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ user, onLogout, courses, allUsers }) {
  const myCourses = courses.filter(c => c.teacher===user.id);
  const [page, setPage] = useState("courses");
  const nav = [
    { id:"courses", label:"My Courses",    icon:"📚", badge:myCourses.length },
    { id:"grades",  label:"Grade Students",icon:"📝", badge:null },
  ];
  const pages = {
    courses: <TeacherCourses user={user} courses={courses} />,
    grades:  <TeacherGrades  user={user} courses={courses} allUsers={allUsers} />,
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
  const [users,   setUsers]   = useState(INIT_USERS);
  const [courses, setCourses] = useState(INIT_COURSES);

  return (
    <>
      <style>{GS}</style>
      {!currentUser
        ? <LoginPage onLogin={setCurrentUser} />
        : currentUser.role==="admin"
          ? <AdminDashboard   user={currentUser} onLogout={()=>setCurrentUser(null)} users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} />
          : currentUser.role==="student"
          ? <StudentDashboard user={currentUser} onLogout={()=>setCurrentUser(null)} courses={courses} />
          : <TeacherDashboard user={currentUser} onLogout={()=>setCurrentUser(null)} courses={courses} allUsers={users} />
      }
    </>
  );
}
