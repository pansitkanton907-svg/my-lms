import React, { useState } from "react";
import Sidebar              from "../components/Sidebar";
import AdminOverview        from "./pages/AdminOverview";
import AdminCreateAccounts  from "./pages/AdminCreateAccounts";
import AdminCreateCourses   from "./pages/AdminCreateCourses";
import AdminViewAccounts    from "./pages/AdminViewAccounts";

export default function AdminDashboard({ user, onLogout, users, setUsers, courses, setCourses, enrollments, setEnrollments }) {
  const [page, setPage] = useState("overview");

  const nav = [
    { id: "overview",        label: "Overview",          icon: "⬡",  badge: null },
    { id: "create-accounts", label: "Create Accounts",   icon: "➕",  badge: null },
    { id: "create-courses",  label: "Course Management", icon: "📚", badge: courses.length },
    { id: "view-accounts",   label: "Account Directory", icon: "👥", badge: users.filter(u => u.role !== "admin").length },
  ];

  const pages = {
    "overview":        (
      <AdminOverview
        users={users}
        courses={courses}
        enrollments={enrollments}
      />
    ),
    "create-accounts": (
      <AdminCreateAccounts
        users={users}
        setUsers={setUsers}
      />
    ),
    "create-courses":  (
      <AdminCreateCourses
        courses={courses}
        setCourses={setCourses}
        users={users}
        enrollments={enrollments}
        setEnrollments={setEnrollments}
      />
    ),
    "view-accounts":   (
      <AdminViewAccounts
        users={users}
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
