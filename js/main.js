(function () {
  let lang = localStorage.getItem("qa-lang") || "en";
  if (lang === "ar") {
    lang = "ur";
    localStorage.setItem("qa-lang", "ur");
  }
  const t = (QA.i18n[lang] || QA.i18n.en);

  function headerHTML(page) {
    const link = (id, href) =>
      `<a href="${href}" class="${page === id ? "is-active" : ""}" data-i18n="${id}">${t[id]}</a>`;
    return `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="index.html">
            <img src="assets/icons/logo.svg" alt="">
            <span>
              <span class="brand-name">Quran Academy</span>
              <span class="brand-sub" data-i18n="tagline">${t.tagline}</span>
            </span>
          </a>
          <nav class="nav" id="nav">
            <button type="button" class="menu-close" id="navClose" aria-label="Close">×</button>
            ${link("home", "index.html")}
            ${link("about", "about.html")}
            ${link("courses", "courses.html")}
            ${link("fees", "fees.html")}
            ${link("blog", "blog.html")}
            ${link("contact", "contact.html")}
            ${link("login", "login.html")}
            <div class="nav-tools">
              <div class="lang-toggle" role="group" aria-label="Language">
                <button type="button" data-set-lang="en" class="${lang === "en" ? "is-on" : ""}">EN</button>
                <button type="button" data-set-lang="ur" class="${lang === "ur" ? "is-on" : ""}">UR</button>
              </div>
              <div class="lang-toggle" role="group" aria-label="Currency">
                <button type="button" data-set-currency="pkr">PKR</button>
                <button type="button" data-set-currency="usd">USD</button>
              </div>
              <a class="btn btn-gold btn-sm" href="contact.html" data-i18n="trial">${t.trial}</a>
            </div>
          </nav>
          <button class="menu-btn" type="button" aria-label="Menu" id="menuBtn"><span></span><span></span><span></span></button>
        </div>
      </header>`;
  }

  function footerHTML() {
    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="foot-grid">
            <div>
              <a class="brand" href="index.html">
                <img src="assets/icons/logo.svg" alt="">
                <span class="brand-name" style="color:#fff">Quran Academy</span>
              </a>
              <p style="margin-top:0.8rem;max-width:18rem">${t.copyNote}</p>
            </div>
            <div>
              <h4 data-i18n="explore">${t.explore}</h4>
              <ul>
                <li><a href="courses.html" data-i18n="courses">${t.courses}</a></li>
                <li><a href="fees.html" data-i18n="fees">${t.fees}</a></li>
                <li><a href="blog.html" data-i18n="blog">${t.blog}</a></li>
                <li><a href="login.html" data-i18n="login">${t.login}</a></li>
              </ul>
            </div>
            <div>
              <h4 data-i18n="academy">${t.academy}</h4>
              <ul>
                <li><a href="about.html" data-i18n="about">${t.about}</a></li>
                <li><a href="contact.html" data-i18n="contact">${t.contact}</a></li>
                <li><a href="${QA.WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <h4 data-i18n="prayer">${t.prayer}</h4>
              <div class="prayer">
                <div><span>Karachi</span><span>Maghrib 19:12</span></div>
                <div><span>Lahore</span><span>Maghrib 19:01</span></div>
                <div><span>Islamabad</span><span>Maghrib 19:05</span></div>
              </div>
            </div>
          </div>
          <div class="copy">
            <span data-i18n="copyLeft">${t.copyLeft}</span>
            <span data-i18n="copyRight">${t.copyRight}</span>
          </div>
        </div>
      </footer>
      <a class="wa-float" href="${QA.WHATSAPP}" target="_blank" rel="noopener" data-tip="${t.waTip}" aria-label="WhatsApp">
        <img src="assets/icons/whatsapp.svg" alt="">
      </a>
      <button class="bot-fab" type="button" id="botFab" aria-label="Open chat">✦</button>
      <div class="chat" id="chat">
        <div class="chat-head">
          <strong data-i18n="chatTitle">${t.chatTitle}</strong>
          <button type="button" id="chatClose" aria-label="Close">×</button>
        </div>
        <div class="chat-body" id="chatBody"></div>
        <div class="chat-qs" id="chatQs"></div>
        <form class="chat-form" id="chatForm">
          <input name="q" placeholder="${lang === "ur" ? "سوال لکھیں…" : "Type a question…"}" autocomplete="off" aria-label="Message">
          <button type="submit">${lang === "ur" ? "بھیجیں" : "Send"}</button>
        </form>
      </div>
      <div class="toast" id="toast" role="status"></div>`;
  }

  function applyLangChrome() {
    document.documentElement.lang = lang === "ur" ? "ur" : "en";
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }

  applyLangChrome();

  const page = document.body.dataset.page || "";
  const isDash = document.body.classList.contains("is-dash");

  if (!isDash) {
    document.body.insertAdjacentHTML("afterbegin", headerHTML(page));
    document.body.insertAdjacentHTML("beforeend", footerHTML());
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = t[el.dataset.i18n];
      if (val == null) return;
      el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const val = t[el.dataset.i18nPlaceholder];
      if (val != null) el.placeholder = val;
    });
    document.querySelectorAll("[data-i18n-toast]").forEach((el) => {
      const val = t[el.dataset.i18nToast];
      if (val != null) el.dataset.toast = val;
    });
    document.querySelectorAll("[data-i18n-rec]").forEach((el) => {
      const val = t[el.dataset.i18nRec];
      if (val != null) el.setAttribute("data-rec", val);
    });
    const cta = document.querySelector("[data-i18n-cta]");
    if (cta && t.postCta) {
      const trial = `<a href="contact.html" style="color:var(--emerald);font-weight:600">${t.postTrialLink}</a>`;
      const courses = `<a href="courses.html" style="color:var(--emerald);font-weight:600">${t.courses}</a>`;
      cta.innerHTML = t.postCta.replace("{trial}", trial).replace("{courses}", courses);
    }
    const titleKey = document.body.dataset.title || (page ? "title_" + page : "");
    if (titleKey && t[titleKey]) document.title = t[titleKey];
    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.setLang === lang);
    });
  }

  applyI18n();

  const currency = () => localStorage.getItem("qa-currency") || "pkr";

  function formatMoney(usd) {
    const n = Number(usd) || 0;
    if (currency() === "usd") return "$" + n;
    return "Rs " + Math.round(n * (QA.USD_TO_PKR || 280)).toLocaleString("en-PK");
  }
  QA.formatMoney = formatMoney;

  function applyCurrency() {
    const cur = currency();
    document.querySelectorAll("[data-set-currency]").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.setCurrency === cur);
    });
    document.querySelectorAll("[data-money]").forEach((el) => {
      el.textContent = formatMoney(el.dataset.money);
    });
  }

  applyCurrency();

  document.querySelectorAll("[data-set-currency]").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("qa-currency", btn.dataset.setCurrency);
      applyCurrency();
    });
  });

  if (!document.getElementById("menuBackdrop")) {
    document.body.insertAdjacentHTML("beforeend", '<div class="menu-backdrop" id="menuBackdrop"></div>');
  }
  const backdrop = document.getElementById("menuBackdrop");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  const side = document.getElementById("side");
  const dashMenu = document.getElementById("dashMenu");
  const chatEl = () => document.getElementById("chat");

  function syncMenus() {
    const open = !!(nav?.classList.contains("open") || side?.classList.contains("open") || chatEl()?.classList.contains("open"));
    backdrop?.classList.toggle("show", open);
  }
  window.qaSyncMenus = syncMenus;

  function closeMenus() {
    nav?.classList.remove("open");
    side?.classList.remove("open");
    chatEl()?.classList.remove("open");
    syncMenus();
  }
  window.qaCloseMenus = closeMenus;

  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !nav.classList.contains("open");
    closeMenus();
    if (willOpen) nav.classList.add("open");
    syncMenus();
  });
  document.getElementById("navClose")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenus();
  });
  dashMenu?.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !side.classList.contains("open");
    closeMenus();
    if (willOpen) side.classList.add("open");
    syncMenus();
  });
  document.getElementById("sideClose")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenus();
  });
  backdrop?.addEventListener("click", closeMenus);
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (nav?.classList.contains("open")) {
      if (!nav.contains(target) && !menuBtn.contains(target)) closeMenus();
    } else if (side?.classList.contains("open")) {
      if (!side.contains(target) && !dashMenu?.contains(target)) closeMenus();
    } else {
      const chat = chatEl();
      const fab = document.getElementById("botFab");
      if (chat?.classList.contains("open") && !chat.contains(target) && !fab?.contains(target)) {
        closeMenus();
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenus();
    document.getElementById("courseModal")?.classList.remove("open");
  });

  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("qa-lang", btn.dataset.setLang);
      location.reload();
    });
  });

  document.querySelectorAll(".faq-item button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const open = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!open) item.classList.add("open");
      document.querySelectorAll(".faq-item").forEach((i) => {
        const mark = i.querySelector("button span:last-of-type");
        if (mark) mark.textContent = i.classList.contains("open") ? "−" : "+";
      });
    });
  });

  window.qaToast = function (msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2600);
  };

  document.querySelectorAll("[data-click-toast]").forEach((btn) => {
    btn.addEventListener("click", () => qaToast(t[btn.dataset.clickToast] || ""));
  });

  document.querySelectorAll("form[data-toast], form[data-i18n-toast]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      qaToast(form.dataset.toast);
      form.reset();
    });
  });

  const tutBtns = document.querySelectorAll("[data-tut]");
  const tutPanels = document.querySelectorAll(".tut-panel");
  function showTut(i) {
    tutBtns.forEach((b) => b.classList.toggle("is-on", Number(b.dataset.tut) === i));
    tutPanels.forEach((p, n) => p.classList.toggle("hidden", n !== i));
  }
  if (tutBtns.length) {
    showTut(0);
    tutBtns.forEach((b) => b.addEventListener("click", () => showTut(Number(b.dataset.tut))));
    document.getElementById("tutPrev")?.addEventListener("click", () => {
      const cur = Number(document.querySelector("[data-tut].is-on")?.dataset.tut || 0);
      showTut(Math.max(0, cur - 1));
    });
    document.getElementById("tutNext")?.addEventListener("click", () => {
      const cur = Number(document.querySelector("[data-tut].is-on")?.dataset.tut || 0);
      showTut(Math.min(tutPanels.length - 1, cur + 1));
    });
  }

  document.querySelectorAll("[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      const f = chip.dataset.filter;
      document.querySelectorAll(".course").forEach((card) => {
        const tracks = card.dataset.track || "";
        card.hidden = f !== "all" && !tracks.includes(f);
      });
    });
  });

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const roleTabs = document.querySelectorAll("[data-role]");
    let role = "student";
    roleTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        role = tab.dataset.role;
        roleTabs.forEach((t2) => t2.classList.toggle("is-on", t2 === tab));
        const adminOnly = role === "admin";
        document.getElementById("registerTab")?.classList.toggle("hidden", adminOnly);
        if (adminOnly) showAuth("login");
      });
    });
    function showAuth(which) {
      document.getElementById("loginForm")?.classList.toggle("hidden", which !== "login");
      document.getElementById("registerForm")?.classList.toggle("hidden", which !== "register");
      document.querySelectorAll("[data-auth]").forEach((b) =>
        b.classList.toggle("is-on", b.dataset.auth === which)
      );
    }
    document.querySelectorAll("[data-auth]").forEach((b) => {
      b.addEventListener("click", () => showAuth(b.dataset.auth));
    });
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const map = {
        student: "student-dashboard.html",
        teacher: "teacher-dashboard.html",
        admin: "admin-dashboard.html",
      };
      location.href = map[role];
    });
    document.getElementById("registerForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      location.href = role === "teacher" ? "teacher-dashboard.html" : "student-dashboard.html";
    });
  }

  document.querySelectorAll(".toggle").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("on"));
  });

  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      qaToast(btn.dataset.approve === "yes" ? t.toastApprove : t.toastDecline);
      row?.remove();
    });
  });

  const modalBg = document.getElementById("courseModal");
  document.querySelectorAll("[data-course]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.course;
      const c = QA.courses.find((x) => x.id === id);
      if (!c || !modalBg) return;
      const titleMap = {
        "tajweed-kids": "cKids",
        nazra: "cNazra",
        "tajweed-adv": "cAdv",
        hifz: "cHifz",
        arabic: "cArabic",
        family: "cFamily",
      };
      const blurbMap = {
        "tajweed-kids": "cKidsFull",
        nazra: "cNazraFull",
        "tajweed-adv": "cAdvFull",
        hifz: "cHifzFull",
        arabic: "cArabicFull",
        family: "cFamilyFull",
      };
      modalBg.querySelector("h3").textContent = t[titleMap[id]] || c.title;
      const fee = (t.modalFee || "").replace("{n}", formatMoney(c.price));
      modalBg.querySelector("p").textContent = (t[blurbMap[id]] || c.blurb) + " " + fee;
      modalBg.classList.add("open");
    });
  });
  modalBg?.addEventListener("click", (e) => {
    if (e.target === modalBg || e.target.closest("[data-close]")) modalBg.classList.remove("open");
  });
})();
