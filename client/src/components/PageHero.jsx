export default function PageHero({ kicker, title, lede, children, wrapClassName = "" }) {
  return (
    <section className="page-hero">
      <div className="page-hero-glow" aria-hidden="true" />
      <div className="page-hero-ornament" aria-hidden="true" />
      <div className="pattern-corner tl" />
      <div className="pattern-corner br" />
      <div className={`wrap${wrapClassName ? ` ${wrapClassName}` : ""}`}>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        {!wrapClassName.includes("teacher-hero") ? (
          <div className="star-div">
            <img src="/assets/icons/star.svg" alt="" />
          </div>
        ) : null}
        {title ? <h1>{title}</h1> : null}
        {lede ? <p className="lede">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}
