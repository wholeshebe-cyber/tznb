const imageModules = import.meta.glob(
  "/src/assets/miniprogram/**/*.{jpg,jpeg,png,webp,gif}",
  { eager: true, query: "?url", import: "default" }
);

const toName = (path) => {
  const rel = path.replace(/^\/src\/assets\/miniprogram\//, "");
  return rel.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
};

const items = Object.entries(imageModules)
  .map(([path, url]) => ({
    type: "image",
    url,
    name: toName(path),
    file: path.replace(/^\/src\/assets\/miniprogram\//, ""),
    sortKey: path,
  }))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey, undefined, { numeric: true }));

export const miniprogramMedia = items;
