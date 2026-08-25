export default function SectionHead({ index, title, en, desc }) {
  return (
    <div className="sec-head">
      <div className="sec-head-top">
        <span className="sec-index mono">{index}</span>
        <h2 className="sec-title">{title}</h2>
        <span className="sec-en mono">{en}</span>
      </div>
      {desc && <p className="sec-desc">{desc}</p>}
      <span className="sec-line" />
    </div>
  );
}
