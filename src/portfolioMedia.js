const imageModules = import.meta.glob(
  "/src/assets/portfolio/**/*.{jpg,jpeg,png,webp,gif}",
  { eager: true, query: "?url", import: "default" }
);
const videoModules = import.meta.glob(
  "/src/assets/portfolio/**/*.{mp4,webm,mov}",
  { eager: true, query: "?url", import: "default" }
);

const toName = (path) => {
  const rel = path.replace(/^\/src\/assets\/portfolio\//, "");
  return rel.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
};

const items = [
  ...Object.entries(imageModules).map(([path, url]) => ({
    type: "image",
    url,
    name: toName(path),
    file: path.replace(/^\/src\/assets\/portfolio\//, ""),
    sortKey: path,
  })),
  ...Object.entries(videoModules).map(([path, url]) => ({
    type: "video",
    url,
    name: toName(path),
    file: path.replace(/^\/src\/assets\/portfolio\//, ""),
    sortKey: path,
  })),
].sort((a, b) => a.sortKey.localeCompare(b.sortKey, undefined, { numeric: true }));

export const portfolioMedia = items;
