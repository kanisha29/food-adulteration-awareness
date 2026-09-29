import { bg } from "../config/images.js";

export default function PageHero({ image, title, subtitle, children, small = true }) {
  return (
    <section className={"page-hero" + (small ? "" : " tall")} style={bg(image)}>
      <div className="container">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
