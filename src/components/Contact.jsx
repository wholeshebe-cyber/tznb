import { contact, profile } from "../data.js";
import Reveal from "./Reveal.jsx";

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact-bg" aria-hidden="true">
        <div className="contact-orb orb-a" />
        <div className="contact-orb orb-b" />
        <div className="hero-grid" />
      </div>
      <div className="container contact-body">
        <Reveal>
          <p className="contact-eyebrow mono">
            <span className="dot" />
            04 / 联系我 — OPEN FOR OPPORTUNITY
          </p>
          <h2 className="contact-title">{contact.headline}</h2>
          <p className="contact-sub">{contact.subline}</p>
        </Reveal>

        <Reveal delay={140}>
          <div className="contact-actions">
            <a className="btn btn-accent btn-lg" href={`mailto:${profile.email}`}>
              发邮件给我
            </a>
            <a className="btn btn-lg" href={`tel:${profile.phoneRaw}`}>
              {profile.phone}
            </a>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="contact-cards">
            <a className="card contact-card" href={`mailto:${profile.email}`}>
              <span className="mono label">EMAIL</span>
              <strong>{profile.email}</strong>
            </a>
            <a className="card contact-card" href={`tel:${profile.phoneRaw}`}>
              <span className="mono label">PHONE</span>
              <strong>{profile.phone}</strong>
            </a>
            <div className="card contact-card">
              <span className="mono label">BASE</span>
              <strong>{profile.city} · 可到岗</strong>
            </div>
          </div>
        </Reveal>
      </div>
      <footer className="contact-foot">
        <div className="container contact-foot-inner">
          <span>© 2026 童政</span>
          <span className="mono">HAND-BUILT WITH REACT + VITE</span>
          <span>广州 · CN</span>
        </div>
      </footer>
    </section>
  );
}
