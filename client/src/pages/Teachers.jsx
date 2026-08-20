import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import TeacherCard from "../components/TeacherCard";
import PageHero from "../components/PageHero";

export default function Teachers() {
  const { t } = useApp();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api("/api/teachers").then(setTeachers).catch(() => setTeachers([]));
  }, []);

  return (
    <main>
      <PageHero kicker={t.teachKicker} title={t.teachersPage} lede={t.teachersLede} />
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
