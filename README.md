# 童政 · 跨境电商运营 个人作品集

基于 React + Vite 的个人作品集网站，部署在 GitHub Pages。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:5173 预览。

## 添加作品（图片 / 视频）

把素材放进 `src/assets/portfolio/` 文件夹：

- 支持图片：jpg / jpeg / png / webp / gif
- 支持视频：mp4 / webm / mov
- 按文件名排序（建议 `01_xxx.jpg`、`02_xxx.mp4` 这样命名）

推送代码到 GitHub 后，GitHub Actions 会自动重新构建并发布，无需手动操作。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个**公开**仓库（Pages 免费版要求公开仓库）。
2. 把本目录推送到该仓库的 `main` 分支。
3. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
4. 推送后等待 Actions 完成，站点地址为 `https://<用户名>.github.io/<仓库名>/`。
