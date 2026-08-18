import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import { coursePath, initials, langLabel } from "../helpers";

export default function TeacherProfile() {
  const { id } = useParams();
  const { t } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/api/teachers/${id}/public`).then(setData).catch(() => setData(null));
  }, [id]);

  const teacher = data?.teacher;
  const courses = data?.courses || [];
  if (!teacher) {
    return (
      <main>
        <section className="section">
          <div className="wrap"><p className="lede">{t.teacherProfile}</p></div>
        </section>
      </main>
    );
  }

  const audience = [teacher.teachKids ? t.filterKids : "", teacher.teachAdults ? t.filterAdults : ""].filter(Boolean).join(" · ");

  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap teacher-hero">
          <div className="avatar avatar-lg">{teacher.avatar ? <img src={teacher.avatar} alt="" /> : initials(teacher.name)}</div>
          <div>
            <p className="kicker">{t.teacherProfile}</p>
            <h1>{teacher.name}</h1>
            <p className="lede">{teacher.introduction || teacher.bio || t.noBio}</p>
            <div className="meta">
              {langLabel(teacher.teachingLanguages, t) ? <span>{langLabel(teacher.teachingLanguages, t)}</span> : null}
              {audience ? <span>· {audience}</span> : null}
            </div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="grid-2">
            {teacher.experience ? (
              <article className="card">
                <h3>{t.experience || "Experience"}</h3>
                <p>{teacher.experience}</p>
              </article>
            ) : null}
            {teacher.qualifications ? (
              <article className="card">
                <h3>Qualifications</h3>
                <p>{teacher.qualifications}</p>
              </article>
            ) : null}
          </div>
          <div className="section-head" style={{ marginTop: "2rem" }}>
            <p className="kicker">{t.coursesKicker}</p>
            <h2>{t.coursesITeach}</h2>
          </div>
          <div className="grid-3">
            {courses.length ? courses.map((c) => (
              <Link className="card course" to={coursePath(c)} key={c.course_id}>
                <div className="icon-orb">{c.icon || "ق"}</div>
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
              </Link>
            )) : <p className="lede">{t.noTeachersYet}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
