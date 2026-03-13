// ─── Material Types ───────────────────────────────────────────────────────────
export const MaterialType = Object.freeze({
  LECTURE:    "Lecture",
  READING:    "Reading",
  LAB:        "Lab",
  ASSIGNMENT: "Assignment",
});

// Type predicate — true for Lab and Assignment (submittable) types
export const isSubmittable = (type) =>
  type === MaterialType.LAB || type === MaterialType.ASSIGNMENT;

// Per-type display metadata
export const MAT_META = {
  [MaterialType.LECTURE]:    { icon: "🎙", color: "#6366f1", bg: "#ede9fe", light: "#f5f3ff", label: "Lecture"    },
  [MaterialType.READING]:    { icon: "📖", color: "#0ea5e9", bg: "#dbeafe", light: "#f0f9ff", label: "Reading"    },
  [MaterialType.LAB]:        { icon: "🧪", color: "#10b981", bg: "#d1fae5", light: "#f0fdf4", label: "Lab"        },
  [MaterialType.ASSIGNMENT]: { icon: "📝", color: "#f59e0b", bg: "#fef3c7", light: "#fffbeb", label: "Assignment" },
};

// ─── Submission Status ────────────────────────────────────────────────────────
export const SubmissionStatus = Object.freeze({
  NOT_SUBMITTED: "NOT_SUBMITTED",
  SUBMITTED:     "SUBMITTED",
  LATE:          "LATE",
  GRADED:        "GRADED",
});

export const STATUS_META = {
  [SubmissionStatus.NOT_SUBMITTED]: { label: "Not Submitted", icon: "○", color: "#64748b", bg: "#f1f5f9" },
  [SubmissionStatus.SUBMITTED]:     { label: "Submitted",     icon: "✓", color: "#10b981", bg: "#d1fae5" },
  [SubmissionStatus.LATE]:          { label: "Late",          icon: "⚠", color: "#ef4444", bg: "#fee2e2" },
  [SubmissionStatus.GRADED]:        { label: "Graded",        icon: "★", color: "#f59e0b", bg: "#fef3c7" },
};

// ─── Exam / Term ──────────────────────────────────────────────────────────────
export const EXAM_TERMS = ["Prelim", "Midterm", "Semi-Final", "Finals"];

export const TERM_META = {
  "Prelim":     { color: "#6366f1", bg: "#ede9fe" },
  "Midterm":    { color: "#0ea5e9", bg: "#dbeafe" },
  "Semi-Final": { color: "#f59e0b", bg: "#fef3c7" },
  "Finals":     { color: "#ef4444", bg: "#fee2e2" },
};

// ─── Question Types ───────────────────────────────────────────────────────────
export const QT_META = {
  MCQ:            { label: "Multiple Choice", icon: "⊙", color: "#6366f1", bg: "#ede9fe" },
  TF:             { label: "True / False",    icon: "⇌", color: "#10b981", bg: "#d1fae5" },
  Identification: { label: "Identification",  icon: "✎", color: "#f59e0b", bg: "#fef3c7" },
};

// ─── Allowed file types for uploads ──────────────────────────────────────────
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
