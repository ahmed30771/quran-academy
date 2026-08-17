# Quran Academy

Static HTML/CSS/JS design for an online Quran academy. No backend — login, forms, chatbot, and dashboards use demo data.

## Open the site

Open `index.html` in a browser, or from this folder:

```bash
npx --yes serve .
```

Then visit the local URL shown in the terminal.

## Pages

- Home — `index.html` (reviews, tutorial, verse of the day, WhatsApp, chatbot)
- About, Courses, Fees, Blog, Contact
- Login — `login.html` (any email/password; pick Student, Teacher, or Admin)
- Dashboards — `student-dashboard.html`, `teacher-dashboard.html`, `admin-dashboard.html`

WhatsApp uses a placeholder number (`+1 555 123 4567`). Replace it in `js/demo-data.js` (`QA.WHATSAPP`) and in the Home/Contact CTAs before launch.

EN/UR toggle translates the full site (pages, login, dashboards, chatbot). Quran verses stay in Arabic script.
