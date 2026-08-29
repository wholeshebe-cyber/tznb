import { strengths } from "../data.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

const Glyph = ({ name }) => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "orbit":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 20h16" />
          <path d="M6 16l4-5 3 3 5-7" />
          <circle cx="18" cy="7" r="1.4" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
        </svg>
      );
    case "cut":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 8a2 2 0 100-4 2 2 0 000 4z" />
          <path d="M7 20a2 2 0 100-4 2 2 0 000 4z" />
          <path d="M8.5 9.2L20 20M8.5 14.8L20 4" />
        </svg>
      );
    case "flow":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="4" width="7" height="5" rx="1" />
          <rect x="14" y="4" width="7" height="5" rx="1" />
          <rect x="8.5" y="15" width="7" height="5" rx="1" />
          <path d="M10 6.5h4M6.5 9v4a2 2 0 002 2h2" />
          <path d="M17.5 9v3.5a2 2 0 01-2 2H15.6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
        </svg>
      );
  }
};

export default function Strengths() {
  return (
    <section id="strengths" className="section strengths">
      <div className="container">
        <Reveal>
          <SectionHead
            index="04"
            title="核心优势"
            en="STRENGTHS"
            desc="不是堆砌标签，而是能直接转化为业务结果的能力组合。"
          />
        </Reveal>

        <div className="strengths-grid">
          {strengths.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 80}>
              <article className="card strength-card">
                <div className="strength-top">
                  <span className="strength-num mono">0{i + 1}</span>
                  <span className="strength-glyph">
                    <Glyph name={item.glyph} />
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
