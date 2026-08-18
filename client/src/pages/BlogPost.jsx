import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";

export default function BlogPost() {
  const { t } = useApp();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    api(`/api/blog/${id}`).then(setPost).catch(() => setPost(null));
    api("/api/blog").then((rows) => setRelated(rows.filter((p) => p.id !== id).slice(0, 3))).catch(() => setRelated([]));
  }, [id]);

  if (!post) {
    return (
      <main className="section">
        <article className="article">
          <p className="lede">{t.blogLede}</p>
          <Link to="/blog">{t.blog}</Link>
        </article>
      </main>
    );
  }

  const paras = String(post.body || "").split("\n").filter(Boolean);

  return (
    <main className="section">
      <article className="article">
        <p className="date" style={{ color: "var(--gold)", fontWeight: 600 }}>{post.date_label} · {post.tag}</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "0.4rem 0 1rem" }}>{post.title}</h1>
        <div className={`cover${post.image_url ? " has-photo" : ""}`}>
          {post.image_url ? <img src={post.image_url} alt="" /> : null}
        </div>
        {paras.map((p) => <p key={p}>{p}</p>)}
        <p>
          When you are ready for live correction, <Link to="/contact" style={{ color: "var(--emerald)", fontWeight: 600 }}>book a free trial</Link> or browse <Link to="/courses" style={{ color: "var(--emerald)", fontWeight: 600 }}>courses</Link>.
        </p>
      </article>
      <div className="wrap" style={{ marginTop: "2.4rem" }}>
        <h2 className="center" style={{ marginBottom: "1.2rem" }}>{t.related}</h2>
        <div className="grid-3">
          {related.map((p) => (
            <Link className="card blog-card" to={`/blog/${p.id}`} key={p.id}>
              <div className={`cover${p.image_url ? " has-photo" : ""}`}>
                {p.image_url ? <img src={p.image_url} alt="" /> : null}
              </div>
              <p className="date" style={{ color: "var(--gold)" }}>{p.tag}</p>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
