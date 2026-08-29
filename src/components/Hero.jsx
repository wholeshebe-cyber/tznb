import { profile } from "../data.js";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-media">
        <video
          src={`${import.meta.env.BASE_URL}assets/hero-bg.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="hero-shade" />
        <div className="hero-grid" />
      </div>

      <div className="container hero-body">
        <p className="hero-eyebrow mono">
          <span className="dot" />
          PORTFOLIO — 2026 · 广州
        </p>

        <h1 className="hero-title">
          <span className="hero-line">增长，是可以</span>
          <span className="hero-line accent">被设计的。</span>
        </h1>

        <p className="hero-sub">{profile.role} · TikTok 东南亚站群 / 淘宝品类 TOP</p>

        <div className="hero-meta mono">
          <span>{profile.name}</span>
          <span className="sep">/</span>
          <span>5 店全链路</span>
          <span className="sep">/</span>
          <span>ROI 8–10</span>
          <span className="sep">/</span>
          <span>类目 TOP3</span>
        </div>

        <div className="hero-actions">
          <a className="btn btn-accent" href="#portfolio">
            查看作品集
          </a>
          <a className="btn" href="#about">
            了解我的经历
          </a>
        </div>
      </div>

      <div className="hero-foot">
        <span className="mono">SCROLL</span>
        <span className="hero-foot-line" />
        <span className="mono">01 / 06</span>
      </div>
    </section>
  );
}
