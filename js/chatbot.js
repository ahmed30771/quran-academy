(function () {
  const chat = document.getElementById("chat");
  const body = document.getElementById("chatBody");
  const qs = document.getElementById("chatQs");
  if (!chat || !body) return;

  let lang = localStorage.getItem("qa-lang") || "en";
  if (lang === "ar") lang = "ur";
  const hello =
    (QA.i18n[lang] && QA.i18n[lang].chatHello) || QA.i18n.en.chatHello;

  const replies = [
    {
      keys: ["course", "courses", "tajweed", "hifz", "learn", "کورس"],
      text: lang === "ur"
        ? "ہم تجوید، ناظرہ، حفظ، قرآنی عربی، بچوں کی کلاسز اور فیملی سلاٹس پیش کرتے ہیں۔ تفصیل کورسز صفحے پر ہے۔"
        : "We offer Tajweed, Nazra recitation, Hifz, Quranic Arabic, kids classes, and family slots. See the Courses page for levels and sample fees.",
    },
    {
      keys: ["fee", "price", "cost", "plan", "فیس"],
      text() {
        const g = QA.formatMoney ? QA.formatMoney(39) : "$39";
        const s = QA.formatMoney ? QA.formatMoney(69) : "$69";
        const h = QA.formatMoney ? QA.formatMoney(89) : "$89";
        return lang === "ur"
          ? `نمونہ پلانز: گروپ ${g}/ماہ، ون ٹو ون ${s}/ماہ، حفظ ٹریک ${h}/ماہ۔ خاندانی رعایت فیس صفحے پر ہے۔`
          : `Sample plans: Starter group from ${g}/mo, Standard 1:1 from ${s}/mo, Hifz Track from ${h}/mo. Family discounts are listed on the Fees page.`;
      },
    },
    {
      keys: ["trial", "free", "demo", "ٹرائل"],
      text: lang === "ur"
        ? "جی ہاں — رابطہ یا واٹس ایپ سے مفت ٹرائل بک کریں۔ پہلے مختصر پلیسمنٹ بات چیت ہوتی ہے۔"
        : "Yes — book a free trial class from Contact or WhatsApp. A teacher meets you for a short placement chat first.",
    },
    {
      keys: ["time", "timing", "schedule", "when", "وقت", "اوقات"],
      text: lang === "ur"
        ? "کلاسز لائیو آن لائن ہیں۔ پاکستان ٹائم کے مطابق سلاٹس ملتے ہیں۔ عام طور پر 30–60 منٹ۔"
        : "Classes are live online. We match you with a teacher across common time zones. Typical slots are 30–60 minutes.",
    },
    {
      keys: ["kid", "child", "children", "بچ"],
      text: lang === "ur"
        ? "بچوں کی کلاس 30 منٹ کی ہوتی ہے، حروف کے ساتھ آسان مشق، اور والدین کو سبق کا خلاصہ ملتا ہے۔"
        : "Kids tracks use shorter 30-minute classes, games for letters, and a parent summary after each lesson.",
    },
    {
      keys: ["adult", "beginner", "start", "بالغ"],
      text: lang === "ur"
        ? "بالغ مبتدی خوش آمدید ہیں۔ ناظرہ یا تجوید سے شروع کریں — پہلے سے تلاوت ضروری نہیں۔"
        : "Adult beginners are welcome. Start with Nazra or Tajweed — no prior recitation required.",
    },
    {
      keys: ["join", "register", "enroll", "sign", "داخلہ"],
      text: lang === "ur"
        ? "لاگ اِن کھولیں، طالب علم یا استاد چنیں، اور رجسٹر ٹیب استعمال کریں۔ اس ڈیمو میں کوئی بھی تفصیل ڈیش بورڈ کھول دے گی۔"
        : "Open Login, choose Student or Teacher, and use the visual register tab. In this demo any details will open the dashboard.",
    },
    {
      keys: ["teacher", "teach", "ijazah", "استاد", "اساتذہ"],
      text: lang === "ur"
        ? "اساتذہ سند یافتہ ہیں (نمونہ کاپی میں اجازہ / تجوید)۔ لاگ اِن → استاد رجسٹر سے درخواست دیں۔"
        : "Teachers are presented as certified (Ijazah / Tajweed credentials in sample copy). Apply via Login → Teacher register.",
    },
    {
      keys: ["human", "whatsapp", "person", "help", "انسان"],
      text: lang === "ur"
        ? "میں واٹس ایپ کھول سکتا ہوں۔ سبز بٹن یا نیچے «انسان سے بات» دبائیں۔"
        : "I can open WhatsApp for a human. Use the green button, or tap Talk to a human below.",
    },
  ];

  const quick = lang === "ur"
    ? ["کورسز", "فیس", "مفت ٹرائل", "بچے", "داخلہ", "انسان سے بات"]
    : ["Courses", "Fees", "Free trial", "Kids vs adults", "How to join", "Talk to a human"];

  function add(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function answer(raw) {
    const q = raw.toLowerCase();
    if (q.includes("human") || q.includes("whatsapp") || q.includes("انسان")) {
      add(lang === "ur" ? "واٹس ایپ کھل رہا ہے (نمونہ نمبر)…" : "Opening WhatsApp (sample number)…", "bot");
      window.open(QA.WHATSAPP, "_blank", "noopener");
      return;
    }
    const hit = replies.find((r) => r.keys.some((k) => q.includes(k)));
    const reply = hit
      ? (typeof hit.text === "function" ? hit.text() : hit.text)
      : lang === "ur"
        ? "میں کورسز، فیس، ٹرائل، اوقات، بچے یا داخلے میں مدد کر سکتا ہوں۔ یا «انسان سے بات» لکھیں۔"
        : "I can help with courses, fees, trial classes, timing, kids vs adults, or how to join. Or say “talk to a human”.";
    add(reply, "bot");
  }

  add(hello, "bot");
  quick.forEach((label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => {
      add(label, "user");
      answer(label);
    });
    qs.appendChild(b);
  });

  document.getElementById("botFab")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !chat.classList.contains("open");
    window.qaCloseMenus?.();
    if (willOpen) chat.classList.add("open");
    window.qaSyncMenus?.();
  });
  document.getElementById("chatClose")?.addEventListener("click", (e) => {
    e.stopPropagation();
    window.qaCloseMenus?.();
  });
  chat?.addEventListener("click", (e) => e.stopPropagation());
  document.getElementById("chatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.target.q;
    const val = (input.value || "").trim();
    if (!val) return;
    add(val, "user");
    answer(val);
    input.value = "";
  });
})();
