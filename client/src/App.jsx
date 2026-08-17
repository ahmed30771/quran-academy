import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Fees from "./pages/Fees";
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
      "/fees": t.title_fees,
      "/blog": t.title_blog,
      "/contact": t.title_contact,
      "/login": t.title_login,
      "/student": t.title_student,
      "/teacher": t.title_teacher,
      "/admin": t.title_admin,
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
          <Route path="/fees" element={<Fees />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<StudentDash />} />
          <Route path="/teacher" element={<TeacherDash />} />
          <Route path="/admin" element={<AdminDash />} />
        </Route>
      </Routes>
    </>
  );
}
