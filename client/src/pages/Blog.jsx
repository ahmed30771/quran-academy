import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import { localized } from "../helpers";
import PageHero from "../components/PageHero";

export default function Blog() {
  const { t, lang } = useApp();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api("/api/blog").then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <main>
      <PageHero kicker={t.blogKicker} title={t.blogTitle} lede={t.blogLede} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-3">
          {posts.map((row) => {
            const p = localized(row, lang);
            return (
            <Link className="card blog-card" to={`/blog/${p.id}`} key={p.id}>
              <div className={`cover${p.image_url ? " has-photo" : ""}`}>
                {p.image_url ? <img src={p.image_url} alt="" /> : null}
              </div>
              <p className="date">{p.date_label} · {p.tag}</p>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
