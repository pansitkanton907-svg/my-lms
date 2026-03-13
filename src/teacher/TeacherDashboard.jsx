import React, { useState } from "react";
import Sidebar        from "../components/Sidebar";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherProfile from "./pages/TeacherProfile";
import TeacherGrades  from "./pages/TeacherGrades";

export default function TeacherDashboard({ user, onLogout, onUpdateUser, courses, setCourses, allUsers, examSubmissions, enrollments }) {
  const myCourses = courses.filter(c => c.teacher === user.id);
  const [page, setPage] = useState("courses");

  const nav = [
    { id: "courses", label: "My Courses",     icon: "📚", badge: myCourses.length },
    { id: "profile", label: "My Profile",     icon: "👤", badge: null },
    { id: "grades",  label: "Grade Students", icon: "📝", badge: null },
  ];

  const pages = {
    courses: (
      <TeacherCourses
        user={user}
        courses={courses}
        setCourses={setCourses}
        allUsers={allUsers}
        enrollments={enrollments}
      />
    ),
    profile: (
      <TeacherProfile
        user={user}
        onUpdateUser={onUpdateUser}
      />
    ),
    grades: (
      <TeacherGrades
        user={user}
        courses={courses}
        allUsers={allUsers}
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
