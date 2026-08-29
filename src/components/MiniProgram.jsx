import { miniprogramMedia } from "../miniprogramMedia.js";
import { miniprogramOrder } from "../data.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function MiniProgram() {
  const orderMap = new Map(miniprogramOrder.map((name, i) => [name, i]));
  const media = [...miniprogramMedia].sort((a, b) => {
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
    <section id="miniprogram" className="section portfolio">
      <div className="container">
        <Reveal>
          <SectionHead
            index="03"
            title="个人小程序设计"
            en="MINI PROGRAM"
            desc="微信小程序从设计规范到落地：界面、交互与数据可视化的完整呈现。"
          />
        </Reveal>

        {media.length === 0 ? (
          <div className="card portfolio-empty">
            <p>小程序设计作品还是空的</p>
            <span className="mono">
              在后台「小程序管理」上传设计图后，这里会自动展示
            </span>
          </div>
        ) : (
          <div className="portfolio-grid">
            {media.map((item, i) => (
              <Reveal
                key={item.url}
                delay={(i % 3) * 80}
                className="portfolio-item-wrap"
              >
                <figure className="card portfolio-card">
                  <img src={item.url} alt={item.name} loading="lazy" />
                  <figcaption>
                    <span>{item.name}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
