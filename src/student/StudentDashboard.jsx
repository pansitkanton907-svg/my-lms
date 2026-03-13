import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import StudentCourses from "./pages/StudentCourses";
import StudentProfile from "./pages/StudentProfile";
import StudentGrades  from "./pages/StudentGrades";

export default function StudentDashboard({ user, onLogout, onUpdateUser, courses, examSubmissions, onSubmitExam, enrollments }) {
  const myEnrollments = enrollments.filter(e => e.studentId === user.id);
  const [page, setPage] = useState("courses");

  const nav = [
    { id: "courses", label: "My Courses",   icon: "📚", badge: myEnrollments.length },
    { id: "profile", label: "My Profile",   icon: "👤", badge: null },
    { id: "grades",  label: "Grade Report", icon: "📊", badge: null },
  ];

  const pages = {
    courses: (
      <StudentCourses
        user={user}
        courses={courses}
        onSubmitExam={onSubmitExam}
        examSubmissions={examSubmissions}
        enrollments={enrollments}
      />
    ),
    profile: (
      <StudentProfile
        user={user}
        onUpdateUser={onUpdateUser}
      />
    ),
    grades: (
      <StudentGrades
        user={user}
        courses={courses}
        examSubmissions={examSubmissions}
        enrollments={enrollments}
      />
    ),
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar navItems={nav} active={page} onNav={setPage} user={user} onLogout={onLogout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
        {pages[page]}
      </div>
    </div>
  );
}
