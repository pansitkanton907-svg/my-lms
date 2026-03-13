import React from "react";
import { isSubmittable } from "../../lib/constants";
import { TypeBadge } from "../../student/components/TypeBadge";
import TeacherLectureDetailView    from "./TeacherLectureDetailView";
import TeacherAssignmentDetailView from "./TeacherAssignmentDetailView";

/**
 * Root container for teacher material detail.
 * Mirrors the student MaterialDetailView structure with breadcrumb + conditional render.
 * Ternary: isSubmittable(type) → TeacherAssignmentDetailView : TeacherLectureDetailView
 */
export default function TeacherMaterialDetailView({ material, course, allUsers, user, onBack, onUpdate, gradeEntries, onGradeUpdate, enrollments }) {
  const showAssignmentLayout = isSubmittable(material.type);

  return (
    <div className="mat-detail-enter" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Breadcrumb bar */}
      <div style={{ height: 46, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#475569", fontFamily: "inherit" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
          onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
          ← Back to Courses
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#94a3b8", flex: 1, minWidth: 0 }}>
          <span>My Courses</span>
          {course && <><span>›</span><span>{course.code}</span></>}
          <span>›</span>
          <span style={{ color: "#1e293b", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{material.title}</span>
        </div>
        <TypeBadge type={material.type} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", background: "#ede9fe", padding: "3px 8px", borderRadius: 5 }}>
          ✏ Teacher View
        </span>
      </div>

      {/* Conditional layout */}
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
