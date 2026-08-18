import { useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import TeacherProfile from "./pages/TeacherProfile";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import StudentDash from "./pages/StudentDash";
import TeacherDash from "./pages/TeacherDash";
import AdminDash from "./pages/AdminDash";

function Titles() {
  const { t } = useApp();
  const { pathname } = useLocation();
  useEffect(() => {
    const map = {
      "/": t.title_home,
      "/about": t.title_about,
      "/courses": t.title_courses,
      "/blog": t.title_blog,
      "/contact": t.title_contact,
      "/login": t.title_login,
      "/student": t.title_student,
      "/student/dashboard": t.title_student,
      "/teacher": t.title_teacher,
      "/teacher/dashboard": t.title_teacher,
      "/admin": t.title_admin,
      "/admin/dashboard": t.title_admin,
    };
    document.title = pathname.startsWith("/blog/") ? t.title_post : (map[pathname] || "Quran Academy");
    window.scrollTo(0, 0);
  }, [pathname, t]);
  return null;
}

export default function App() {
  return (
    <>
      <Titles />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/teachers/:id" element={<TeacherProfile />} />
          <Route path="/fees" element={<Navigate to="/courses" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDash />} />
          <Route path="/teacher/dashboard" element={<TeacherDash />} />
          <Route path="/admin/dashboard" element={<AdminDash />} />
        </Route>
      </Routes>
    </>
  );
}
