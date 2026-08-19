import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import TeacherCard from "../components/TeacherCard";

export default function Teachers() {
  const { t } = useApp();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api("/api/teachers").then(setTeachers).catch(() => setTeachers([]));
  }, []);

  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap">
          <p className="kicker">{t.teachKicker}</p>
          <h1>{t.teachersPage}</h1>
          <p className="lede">{t.teachersLede}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-3">
          {teachers.length
            ? teachers.map((p) => <TeacherCard key={p.id} teacher={p} t={t} />)
            : <p className="lede">{t.noTeachersList}</p>}
        </div>
      </section>
    </main>
  );
}
