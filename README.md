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

## 网页后台管理（上传作品 + 编辑内容）

网站右上角有「管理」入口，不需要改代码就能发布作品和修改内容：

1. 打开网站，点击右上角「管理」。
2. 输入管理密码。
3. 在「设置」里填入 GitHub 密钥（Token）：
   - GitHub → Settings → Developer settings → Fine-grained personal access tokens
   - Repository access 只选择 `wholeshebe-cyber/tznb`
   - Permissions → Contents 设为 **Read and write**
   - 生成后粘贴到后台「设置」→「保存并验证」
4. 「作品管理」可以上传图片/视频（自动进入作品集）、删除旧作品；
   还支持**拖动排序**：按住手柄拖动调整作品顺序，点「保存顺序」即可；
   「小程序管理」可以上传/删除「个人小程序设计」区块的图片，同样支持拖动排序；
   「内容编辑」可以改个人介绍、数据指标、工作经历、核心优势、联系文案。
5. 保存后自动提交到 GitHub，网站约 1-3 分钟后自动更新。

注意：GitHub 密钥只保存在浏览器本地；如果怀疑泄露，请到 GitHub 立即撤销。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个**公开**仓库（Pages 免费版要求公开仓库）。
2. 把本目录推送到该仓库的 `main` 分支。
3. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
4. 推送后等待 Actions 完成，站点地址为 `https://<用户名>.github.io/<仓库名>/`。
