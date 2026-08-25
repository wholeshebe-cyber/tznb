import { profile, stats, timeline } from "../data.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <Reveal>
          <SectionHead
            index="01"
            title="个人经历"
            en="ABOUT"
            desc="两条业务线的实战履历：跨境站群从 0 到盈利，国内品类店做到 TOP3。"
          />
        </Reveal>

        <div className="about-grid">
          <Reveal className="about-side">
            <div className="avatar-card">
              <div className="avatar-frame">
                <img src={profile.avatar} alt="童政" />
                <span className="avatar-ring" />
              </div>
              <div className="avatar-name">
                <strong>{profile.name}</strong>
                <span className="mono">{profile.roleEn}</span>
              </div>
              <div className="avatar-contacts">
                <a href={`tel:${profile.phoneRaw}`} className="contact-row">
                  <span className="mono">TEL</span>
                  <span>{profile.phone}</span>
                </a>
                <a href={`mailto:${profile.email}`} className="contact-row">
                  <span className="mono">MAIL</span>
                  <span>{profile.email}</span>
                </a>
                <div className="contact-row">
                  <span className="mono">BASE</span>
                  <span>{profile.city}</span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="about-main">
            <Reveal delay={80}>
              <div className="about-intro">
                {profile.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="about-meta">
                <div>
                  <span className="mono label">教育背景</span>
                  <span>{profile.education}</span>
                </div>
                <div>
                  <span className="mono label">从业年限</span>
                  <span>{profile.experience}</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="stats-grid">
                {stats.map((s) => (
                  <div className="stat" key={s.label}>
                    <span className="stat-value">
                      {s.value}
                      {s.unit && <em>{s.unit}</em>}
                    </span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <div className="timeline">
              {timeline.map((job, i) => (
                <Reveal delay={i * 90} className="timeline-item" key={job.company}>
                  <div className="timeline-rail">
                    <span className="timeline-dot" />
                    {i < timeline.length - 1 && <span className="timeline-line" />}
                  </div>
                  <article className="card timeline-card">
                    <div className="timeline-head">
                      <div>
                        <span className="mono timeline-period">{job.period}</span>
                        <h3>{job.company}</h3>
                        <p className="timeline-role">{job.role}</p>
                      </div>
                      <span className="timeline-highlight mono">{job.highlight}</span>
                    </div>
                    <ul className="timeline-points">
                      {job.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
