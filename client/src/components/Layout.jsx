import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "./Chatbot";

export default function Layout() {
  const [chat, setChat] = useState(false);
  const loc = useLocation();
  const dash = ["/student", "/teacher", "/admin"].some((p) => loc.pathname.startsWith(p));

  if (dash) return <Outlet />;

  return (
    <>
      <Header />
      <Outlet />
      <Footer onChat={() => setChat(true)} />
      <Chatbot open={chat} onOpen={() => setChat((v) => !v)} onClose={() => setChat(false)} />
    </>
  );
}
