import { Link } from "react-router-dom";
import { initials, starLine } from "../helpers";

export default function TeacherCard({ teacher, t, compact = false }) {
  const about = teacher.introduction || teacher.bio || t.noBio;
  const rating = Number(teacher.rating);
  const stars = Number.isFinite(rating) && rating > 0 ? rating : 5;

  return (
    <article className={`card teacher-card teacher-slide${compact ? "" : " teacher-slide-full"}`}>
      <div className="avatar">{teacher.avatar ? <img src={teacher.avatar} alt="" /> : initials(teacher.name)}</div>
      <h3>{teacher.name}</h3>
      <div className="stars" aria-label={`${stars} ${t.teacherRating}`}>{starLine(stars)}</div>
      <p className="teacher-about">{about}</p>
      {teacher.experience ? <p className="teacher-exp"><strong>{t.experience}:</strong> {teacher.experience}</p> : null}
      <Link className="btn btn-gold btn-sm" to={`/teachers/${teacher.id}`}>{t.viewProfile}</Link>
    </article>
  );
}
