import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SITE } from "../api";

export default function Chatbot({ open, onClose, onOpen }) {
  const { t, lang } = useApp();
  const [msgs, setMsgs] = useState([{ who: "bot", text: t.chatHello }]);
  const [q, setQ] = useState("");

  const quick = lang === "ur"
    ? ["کورسز", "فیس", "مفت ٹرائل", "بچے", "داخلہ", "انسان سے بات"]
    : ["Courses", "Fees", "Free trial", "Kids vs adults", "How to join", "Talk to a human"];

  function reply(raw) {
    const s = raw.toLowerCase();
    let text = lang === "ur"
      ? "میں کورسز، فیس، ٹرائل، اوقات، بچے یا داخلے میں مدد کر سکتا ہوں۔ یا «انسان سے بات» لکھیں۔"
      : "I can help with courses, fees, trial classes, timing, kids vs adults, or how to join. Or say “talk to a human”.";
    if (/human|whatsapp|انسان/.test(s)) {
      text = lang === "ur" ? "واٹس ایپ کھل رہا ہے…" : "Opening WhatsApp…";
      window.open(SITE.WHATSAPP, "_blank", "noopener");
    } else if (/fee|price|cost|plan|فیس/.test(s)) {
      text = lang === "ur"
        ? "ہر کورس کی ماہانہ فیس کورسز کے صفحے پر لکھی ہوئی ہے۔"
        : "Each course lists its monthly fee on the Courses page.";
    } else if (/course|tajweed|hifz|learn|کورس/.test(s)) {
      text = lang === "ur" ? "ہم تجوید، ناظرہ، حفظ اور قرآنی عربی پیش کرتے ہیں۔" : "We offer Tajweed, Nazra, Hifz, and Quranic Arabic.";
    } else if (/trial|free|ٹرائل/.test(s)) {
      text = lang === "ur"
        ? "ہر کورس کے پہلے دن کا مفت ٹرائل کورسز کے صفحے پر ہے۔ پہلے لاگ اِن یا رجسٹر کریں۔ ایک کورس کا ٹرائل دوسرے کورسز کے لیے باقی رہتا ہے۔"
        : "Each course has its own first-day free trial on the Courses page. Log in or register first. A trial on one course does not use the trial on others.";
    }
    setMsgs((m) => [...m, { who: "user", text: raw }, { who: "bot", text }]);
  }

  return (
    <>
      <button className="bot-fab" type="button" onClick={onOpen} aria-label="Open chat">✦</button>
      <div className={`chat${open ? " open" : ""}`}>
        <div className="chat-head">
          <strong>{t.chatTitle}</strong>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="chat-body">
          {msgs.map((m, i) => <div key={i} className={`msg ${m.who}`}>{m.text}</div>)}
        </div>
        <div className="chat-qs">
          {quick.map((label) => (
            <button key={label} type="button" onClick={() => reply(label)}>{label}</button>
          ))}
        </div>
        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); if (!q.trim()) return; reply(q.trim()); setQ(""); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === "ur" ? "سوال لکھیں…" : "Type a question…"} />
          <button type="submit">{lang === "ur" ? "بھیجیں" : "Send"}</button>
        </form>
      </div>
    </>
  );
}
