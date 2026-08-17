import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";

export default function Blog() {
  const { t } = useApp();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api("/api/blog").then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap">
          <p className="kicker">{t.blogKicker}</p>
          <h1>{t.blogTitle}</h1>
          <p className="lede">{t.blogLede}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-3">
          {posts.map((p) => (
            <Link className="card blog-card" to={`/blog/${p.id}`} key={p.id}>
              <div className="cover" />
              <p className="date">{p.date_label} · {p.tag}</p>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
