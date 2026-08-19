import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { initials, localized, starLine } from "../helpers";

export default function TeacherCard({ teacher, t, compact = false }) {
  const { lang } = useApp();
  const view = localized(teacher, lang);
  const about = view.introduction || view.bio || t.noBio;
  const rating = Number(view.rating);
  const stars = Number.isFinite(rating) && rating > 0 ? rating : 5;

  return (
    <article className={`card teacher-card teacher-slide${compact ? "" : " teacher-slide-full"}`}>
      <div className="avatar">{view.avatar ? <img src={view.avatar} alt="" /> : initials(teacher.name)}</div>
      <h3>{view.name}</h3>
      <div className="stars" aria-label={`${stars} ${t.teacherRating}`}>{starLine(stars)}</div>
      <p className="teacher-about">{about}</p>
      {view.experience ? <p className="teacher-exp"><strong>{t.experience}:</strong> {view.experience}</p> : null}
      <Link className="btn btn-gold btn-sm" to={`/teachers/${teacher.id}`}>{t.viewProfile}</Link>
    </article>
  );
}
