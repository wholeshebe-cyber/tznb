import { portfolioMedia } from "../portfolioMedia.js";
import { portfolioOrder } from "../data.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function Portfolio() {
  const orderMap = new Map(portfolioOrder.map((name, i) => [name, i]));
  const media = [...portfolioMedia].sort((a, b) => {
    const ai = orderMap.get(a.file);
    const bi = orderMap.get(b.file);
    if (ai === undefined && bi === undefined) {
      return a.sortKey.localeCompare(b.sortKey, undefined, { numeric: true });
    }
    if (ai === undefined) return 1;
    if (bi === undefined) return -1;
    return ai - bi;
  });

  return (
    <section id="portfolio" className="section portfolio">
      <div className="container">
        <Reveal>
          <SectionHead
            index="02"
            title="作品集"
            en="PORTFOLIO"
            desc="图片和视频作品都在这里——素材放入文件夹后自动展示。"
          />
        </Reveal>

        {media.length === 0 ? (
          <div className="card portfolio-empty">
            <p>作品集还是空的</p>
            <span className="mono">
              把图片 / 视频放入 src/assets/portfolio 后，这里会自动展示
            </span>
          </div>
        ) : (
          <div className="portfolio-grid">
            {media.map((item, i) => (
              <Reveal key={item.url} delay={(i % 3) * 80} className="portfolio-item-wrap">
                <figure className="card portfolio-card">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      muted
                      loop
                      playsInline
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img src={item.url} alt={item.name} loading="lazy" />
                  )}
                  {item.type === "image" && (
                    <figcaption>
                      <span>{item.name}</span>
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
