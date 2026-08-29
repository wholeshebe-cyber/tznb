import { useEffect, useRef, useState } from "react";
import adminConfig from "../admin-config.json";
import builtContent from "../content.json";
import {
  clearToken,
  deleteFile,
  formatSize,
  getEffectiveHash,
  getFile,
  getSettings,
  getToken,
  isAuthed,
  listDir,
  putBinary,
  putFile,
  readFileAsBase64,
  sanitizeFileName,
  saveSettings,
  setAuthed,
  setEffectiveHash,
  setToken,
  sha256,
  testToken,
} from "../admin.js";

const PORTFOLIO_PATH = "src/assets/portfolio";
const MINIPROGRAM_PATH = "src/assets/miniprogram";
const CONTENT_PATH = "src/content.json";
const CONFIG_PATH = "src/admin-config.json";

const GLYPHS = ["orbit", "chart", "spark", "cut", "flow", "bolt"];

export default function Admin() {
  const [authed, setAuthedState] = useState(isAuthed);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [tab, setTab] = useState("works");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type = "ok") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const login = async (e) => {
    e.preventDefault();
    const hash = await sha256(pwd);
    if (hash === getEffectiveHash(adminConfig.passwordHash)) {
      setAuthed(true);
      setAuthedState(true);
      setPwd("");
      setPwdError("");
    } else {
      setPwdError("密码不正确");
    }
  };

  const logout = () => {
    setAuthed(false);
    setAuthedState(false);
  };

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <a className="admin-back" href="#/">
            ← 返回网站
          </a>
          <div className="admin-login-card">
            <span className="nav-logo-mark">TZ</span>
            <h1>网站管理后台</h1>
            <p className="admin-login-sub">输入管理密码进入</p>
            <form onSubmit={login}>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="管理密码"
                autoFocus
              />
              {pwdError && <p className="admin-error">{pwdError}</p>}
              <button className="btn btn-accent" type="submit">
                进入后台
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-top">
        <div className="admin-top-inner">
          <span className="nav-logo-mark">TZ</span>
          <strong>网站管理后台</strong>
          <span className="admin-top-spacer" />
          <a className="admin-link" href="#/">
            返回网站
          </a>
          <button className="admin-link" onClick={logout}>
            退出登录
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          className={tab === "works" ? "active" : ""}
          onClick={() => setTab("works")}
        >
          作品管理
        </button>
        <button
          className={tab === "miniprogram" ? "active" : ""}
          onClick={() => setTab("miniprogram")}
        >
          小程序管理
        </button>
        <button
          className={tab === "content" ? "active" : ""}
          onClick={() => setTab("content")}
        >
          内容编辑
        </button>
        <button
          className={tab === "settings" ? "active" : ""}
          onClick={() => setTab("settings")}
        >
          设置
        </button>
      </nav>

      <main className="admin-main container">
        {!getToken() && tab !== "settings" && (
          <div className="admin-warn">
            还没有配置 GitHub 密钥，请在「设置」里填入后再上传/编辑。
          </div>
        )}
        {tab === "works" && (
          <MediaManager
            folder={PORTFOLIO_PATH}
            orderKey="portfolioOrder"
            label="作品"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            namePlaceholder="作品名（可选，留空用文件名）"
            uploadText="上传作品"
            hint="支持图片（jpg / png / webp / gif）和视频（mp4 / webm / mov），上传后自动展示在作品集。"
            withVideo
            onToast={showToast}
          />
        )}
        {tab === "miniprogram" && (
          <MediaManager
            folder={MINIPROGRAM_PATH}
            orderKey="miniprogramOrder"
            label="小程序设计图"
            accept="image/*"
            namePlaceholder="图片名（可选，留空用文件名）"
            uploadText="上传图片"
            hint="支持图片（jpg / png / webp / gif），上传后自动展示在「个人小程序设计」区块。"
            onToast={showToast}
          />
        )}
        {tab === "content" && <ContentTab onToast={showToast} />}
        {tab === "settings" && <SettingsTab onToast={showToast} />}
      </main>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

/* ---------- 作品管理 ---------- */
function MediaManager({
  folder,
  orderKey,
  label,
  accept,
  namePlaceholder,
  uploadText,
  hint,
  withVideo,
  onToast,
}) {
  const { repo, branch } = getSettings(adminConfig);
  const [files, setFiles] = useState(null);
  const [order, setOrder] = useState([]);
  const [initialOrder, setInitialOrder] = useState([]);
  const [contentSha, setContentSha] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const refresh = async () => {
    try {
      const items = await listDir(repo, branch, folder);
      setFiles(items);
      const cfg = await getFile(repo, branch, CONTENT_PATH);
      if (cfg) {
        const parsed = JSON.parse(cfg.content);
        const savedOrder = Array.isArray(parsed[orderKey])
          ? parsed[orderKey]
          : [];
        setOrder(savedOrder);
        setInitialOrder(savedOrder);
        setContentSha(cfg.sha);
      } else {
        setOrder([]);
        setInitialOrder([]);
        setContentSha(null);
      }
    } catch (err) {
      setFiles([]);
      onToast(err.message, "err");
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMedia = (name) =>
    withVideo
      ? /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i.test(name)
      : /\.(jpg|jpeg|png|webp|gif)$/i.test(name);
  const media = (files || []).filter((f) => f.type === "file" && isMedia(f.name));

  const orderIndex = new Map(order.map((name, i) => [name, i]));
  const sortedMedia = [...media].sort((a, b) => {
    const ai = orderIndex.get(a.name);
    const bi = orderIndex.get(b.name);
    if (ai === undefined && bi === undefined) {
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    }
    if (ai === undefined) return 1;
    if (bi === undefined) return -1;
    return ai - bi;
  });

  const dirty = JSON.stringify(order) !== JSON.stringify(initialOrder);

  const reorder = (from, to) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= sortedMedia.length ||
      to >= sortedMedia.length
    ) {
      return;
    }
    const names = sortedMedia.map((m) => m.name);
    const arr = [...names];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setOrder(arr);
  };

  const onDragStart = (i) => setDragIndex(i);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (i) => {
    if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
    setDragIndex(null);
  };

  const saveOrder = async () => {
    setBusy(true);
    try {
      const cfg = await getFile(repo, branch, CONTENT_PATH);
      const parsed = cfg
        ? JSON.parse(cfg.content)
        : JSON.parse(JSON.stringify(builtContent));
      parsed[orderKey] = order;
      await putFile(
        repo,
        branch,
        CONTENT_PATH,
        JSON.stringify(parsed, null, 2),
        `调整${label}展示顺序`,
        cfg?.sha
      );
      setInitialOrder(order);
      setContentSha(cfg?.sha);
      onToast("顺序已保存，网站约 1-3 分钟后自动更新");
    } catch (err) {
      onToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    if (!file) {
      onToast(withVideo ? "请先选择要上传的图片或视频" : "请先选择要上传的图片", "err");
      return;
    }
    if (file.size > 90 * 1024 * 1024) {
      onToast("文件太大（GitHub 单文件上限 100MB，建议不超过 90MB）", "err");
      return;
    }
    const name = sanitizeFileName(title || file.name);
    const path = `${folder}/${name}`;
    setBusy(true);
    try {
      const existing = await getFile(repo, branch, path);
      if (existing && !window.confirm(`文件「${name}」已存在，是否覆盖？`)) {
        setBusy(false);
        return;
      }
      const base64 = await readFileAsBase64(file);
      await putBinary(
        repo,
        branch,
        path,
        base64,
        `上传${label}：${name}`,
        existing?.sha
      );
      onToast(`已提交「${name}」，网站约 1-3 分钟后自动更新`);
      setFile(null);
      setTitle("");
      refresh();
    } catch (err) {
      onToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`确定删除「${item.name}」？删除后需重新上传才能恢复。`)) {
      return;
    }
    setDeleting(item.path);
    try {
      await deleteFile(
        repo,
        branch,
        item.path,
        item.sha,
        `删除${label}：${item.name}`
      );
      onToast(`已删除「${item.name}」，网站约 1-3 分钟后自动更新`);
      refresh();
    } catch (err) {
      onToast(err.message, "err");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-panel">
      <section className="admin-card">
        <h2>上传新{label}</h2>
        <p className="admin-hint">{hint}</p>
        <div className="admin-upload">
          <input
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={namePlaceholder}
          />
          <button
            className="btn btn-accent"
            onClick={upload}
            disabled={busy}
          >
            {busy ? "上传中…" : uploadText}
          </button>
        </div>
        {file && (
          <p className="admin-hint">
            已选择：{file.name}（{formatSize(file.size)}）
          </p>
        )}
      </section>

      <section className="admin-card">
        <h2>已有{label}（{sortedMedia.length}）</h2>
        <p className="admin-hint">
          按住手柄拖动调整顺序，或用 ↑ / ↓ 按钮；调整后点「保存顺序」。
        </p>
        {dirty && (
          <div className="admin-order-save">
            <button className="btn btn-accent" onClick={saveOrder} disabled={busy}>
              {busy ? "保存中…" : "保存当前顺序"}
            </button>
          </div>
        )}
        {files === null ? (
          <p className="admin-hint">加载中…</p>
        ) : sortedMedia.length === 0 ? (
          <p className="admin-hint">还没有{label}，上传一个吧。</p>
        ) : (
          <ul className="admin-file-list admin-sort-list">
            {sortedMedia.map((item, i) => (
              <li
                key={item.path}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(i)}
                className={dragIndex === i ? "dragging" : ""}
              >
                <span className="admin-drag-handle" title="拖动排序">
                  ⠿
                </span>
                <span className="admin-file-name">{item.name}</span>
                <span className="admin-file-size">{formatSize(item.size)}</span>
                <span className="admin-order-btns">
                  <button
                    className="admin-btn-add"
                    onClick={() => reorder(i, i - 1)}
                    disabled={i === 0 || busy}
                    title="上移"
                  >
                    ↑
                  </button>
                  <button
                    className="admin-btn-add"
                    onClick={() => reorder(i, i + 1)}
                    disabled={i === sortedMedia.length - 1 || busy}
                    title="下移"
                  >
                    ↓
                  </button>
                </span>
                <button
                  className="admin-btn-danger"
                  onClick={() => remove(item)}
                  disabled={deleting === item.path}
                >
                  {deleting === item.path ? "删除中…" : "删除"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------- 内容编辑 ---------- */
function ContentTab({ onToast }) {
  const { repo, branch } = getSettings(adminConfig);
  const [draft, setDraft] = useState(null);
  const [sha, setSha] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFile(repo, branch, CONTENT_PATH);
        if (data) {
          setDraft(JSON.parse(data.content));
          setSha(data.sha);
        } else {
          setDraft(JSON.parse(JSON.stringify(builtContent)));
          setSha(null);
        }
      } catch (err) {
        onToast(err.message, "err");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await putFile(
        repo,
        branch,
        CONTENT_PATH,
        JSON.stringify(draft, null, 2),
        "网页后台更新网站内容",
        sha
      );
      onToast("内容已保存，网站约 1-3 分钟后自动更新");
      window.location.reload();
    } catch (err) {
      onToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  if (!draft) return <p className="admin-hint">加载内容中…</p>;

  const setProfile = (key, value) =>
    setDraft((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));

  const setIntro = (text) => {
    const paragraphs = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setProfile("intro", paragraphs);
  };

  return (
    <div className="admin-panel">
      {sha === null && (
        <div className="admin-warn">
          仓库里还没有 content.json，当前显示的是网站内置内容；保存后会创建该文件。
        </div>
      )}
      <section className="admin-card">
        <h2>基本信息</h2>
        <div className="admin-grid2">
          <Field label="姓名" value={draft.profile.name} onChange={(v) => setProfile("name", v)} />
          <Field label="职位" value={draft.profile.role} onChange={(v) => setProfile("role", v)} />
          <Field label="英文职位" value={draft.profile.roleEn} onChange={(v) => setProfile("roleEn", v)} />
          <Field label="电话（显示）" value={draft.profile.phone} onChange={(v) => setProfile("phone", v)} />
          <Field label="电话（纯数字）" value={draft.profile.phoneRaw} onChange={(v) => setProfile("phoneRaw", v)} />
          <Field label="邮箱" value={draft.profile.email} onChange={(v) => setProfile("email", v)} />
          <Field label="城市" value={draft.profile.city} onChange={(v) => setProfile("city", v)} />
          <Field label="教育背景" value={draft.profile.education} onChange={(v) => setProfile("education", v)} />
          <Field label="经验标语" value={draft.profile.experience} onChange={(v) => setProfile("experience", v)} />
        </div>
        <div className="admin-field">
          <label>个人介绍（每行一段）</label>
          <textarea
            rows={5}
            value={draft.profile.intro.join("\n")}
            onChange={(e) => setIntro(e.target.value)}
          />
        </div>
      </section>

      <section className="admin-card">
        <h2>数据指标</h2>
        {draft.stats.map((s, i) => (
          <div className="admin-row" key={i}>
            <input
              className="admin-sm"
              value={s.value}
              placeholder="数值"
              onChange={(e) =>
                setDraft((d) => {
                  const stats = [...d.stats];
                  stats[i] = { ...stats[i], value: e.target.value };
                  return { ...d, stats };
                })
              }
            />
            <input
              className="admin-xs"
              value={s.unit}
              placeholder="单位"
              onChange={(e) =>
                setDraft((d) => {
                  const stats = [...d.stats];
                  stats[i] = { ...stats[i], unit: e.target.value };
                  return { ...d, stats };
                })
              }
            />
            <input
              value={s.label}
              placeholder="说明"
              onChange={(e) =>
                setDraft((d) => {
                  const stats = [...d.stats];
                  stats[i] = { ...stats[i], label: e.target.value };
                  return { ...d, stats };
                })
              }
            />
            <button
              className="admin-btn-danger"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  stats: d.stats.filter((_, j) => j !== i),
                }))
              }
            >
              删除
            </button>
          </div>
        ))}
        <button
          className="admin-btn-add"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              stats: [...d.stats, { value: "", unit: "", label: "" }],
            }))
          }
        >
          + 添加指标
        </button>
      </section>

      <section className="admin-card">
        <h2>工作经历</h2>
        {draft.timeline.map((job, i) => (
          <div className="admin-job" key={i}>
            <div className="admin-grid2">
              <Field label="时间段" value={job.period} onChange={(v) => setJob(i, "period", v)} />
              <Field label="公司" value={job.company} onChange={(v) => setJob(i, "company", v)} />
              <Field label="职位" value={job.role} onChange={(v) => setJob(i, "role", v)} />
              <Field label="亮点标签" value={job.highlight} onChange={(v) => setJob(i, "highlight", v)} />
            </div>
            <div className="admin-field">
              <label>工作内容（每行一条）</label>
              <textarea
                rows={4}
                value={job.points.join("\n")}
                onChange={(e) =>
                  setJob(
                    i,
                    "points",
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
            <div className="admin-job-actions">
              <button
                className="admin-btn-add"
                onClick={() => moveJob(i, -1)}
                disabled={i === 0}
              >
                ↑ 上移
              </button>
              <button
                className="admin-btn-add"
                onClick={() => moveJob(i, 1)}
                disabled={i === draft.timeline.length - 1}
              >
                ↓ 下移
              </button>
              <button
                className="admin-btn-danger"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    timeline: d.timeline.filter((_, j) => j !== i),
                  }))
                }
              >
                删除这段经历
              </button>
            </div>
          </div>
        ))}
        <button
          className="admin-btn-add"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              timeline: [
                ...d.timeline,
                {
                  period: "",
                  company: "",
                  role: "",
                  highlight: "",
                  points: [],
                },
              ],
            }))
          }
        >
          + 添加工作经历
        </button>
      </section>

      <section className="admin-card">
        <h2>核心优势</h2>
        {draft.strengths.map((s, i) => (
          <div className="admin-row" key={i}>
            <input
              className="admin-sm"
              value={s.title}
              placeholder="标题"
              onChange={(e) => setStrength(i, "title", e.target.value)}
            />
            <select
              value={s.glyph}
              onChange={(e) => setStrength(i, "glyph", e.target.value)}
            >
              {GLYPHS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              className="admin-btn-danger"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  strengths: d.strengths.filter((_, j) => j !== i),
                }))
              }
            >
              删除
            </button>
            <input
              value={s.desc}
              placeholder="描述"
              onChange={(e) => setStrength(i, "desc", e.target.value)}
            />
          </div>
        ))}
        <button
          className="admin-btn-add"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              strengths: [...d.strengths, { title: "", desc: "", glyph: "spark" }],
            }))
          }
        >
          + 添加优势
        </button>
      </section>

      <section className="admin-card">
        <h2>联系文案</h2>
        <div className="admin-grid2">
          <Field
            label="大标题"
            value={draft.contact.headline}
            onChange={(v) =>
              setDraft((d) => ({ ...d, contact: { ...d.contact, headline: v } }))
            }
          />
          <Field
            label="副标题"
            value={draft.contact.subline}
            onChange={(v) =>
              setDraft((d) => ({ ...d, contact: { ...d.contact, subline: v } }))
            }
          />
        </div>
      </section>

      <div className="admin-savebar">
        <button className="btn btn-accent btn-lg" onClick={save} disabled={busy}>
          {busy ? "保存中…" : "保存全部修改"}
        </button>
      </div>
    </div>
  );

  function setJob(i, key, value) {
    setDraft((d) => {
      const timeline = [...d.timeline];
      timeline[i] = { ...timeline[i], [key]: value };
      return { ...d, timeline };
    });
  }

  function moveJob(i, delta) {
    setDraft((d) => {
      const timeline = [...d.timeline];
      const j = i + delta;
      if (j < 0 || j >= timeline.length) return d;
      [timeline[i], timeline[j]] = [timeline[j], timeline[i]];
      return { ...d, timeline };
    });
  }

  function setStrength(i, key, value) {
    setDraft((d) => {
      const strengths = [...d.strengths];
      strengths[i] = { ...strengths[i], [key]: value };
      return { ...d, strengths };
    });
  }
}

function Field({ label, value, onChange }) {
  if (label === undefined) return null;
  return (
    <div className="admin-field">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ---------- 设置 ---------- */
function SettingsTab({ onToast }) {
  const defaults = getSettings(adminConfig);
  const [repo, setRepo] = useState(defaults.repo);
  const [branch, setBranch] = useState(defaults.branch);
  const [token, setTokenState] = useState(getToken());
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const saveGit = () => {
    saveSettings({ repo: repo.trim(), branch: branch.trim() });
    onToast("仓库设置已保存");
  };

  const saveToken = async () => {
    setBusy(true);
    try {
      const login = await testToken(token);
      setToken(token);
      onToast(`密钥有效，GitHub 账号：${login}`);
    } catch (err) {
      onToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const removeToken = () => {
    clearToken();
    setTokenState("");
    onToast("已清除 GitHub 密钥");
  };

  const changePwd = async () => {
    if (newPwd.length < 6) {
      onToast("新密码至少 6 位", "err");
      return;
    }
    if ((await sha256(curPwd)) !== getEffectiveHash(adminConfig.passwordHash)) {
      onToast("当前密码不正确", "err");
      return;
    }
    setBusy(true);
    try {
      const hash = await sha256(newPwd);
      const cfg = await getFile(repo.trim(), branch.trim(), CONFIG_PATH);
      const config = cfg ? JSON.parse(cfg.content) : { ...adminConfig };
      config.passwordHash = hash;
      await putFile(
        repo.trim(),
        branch.trim(),
        CONFIG_PATH,
        JSON.stringify(config, null, 2),
        "修改后台管理密码",
        cfg?.sha
      );
      setEffectiveHash(hash);
      setCurPwd("");
      setNewPwd("");
      onToast("密码已修改并发布");
    } catch (err) {
      onToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-panel">
      <section className="admin-card">
        <h2>GitHub 连接</h2>
        <p className="admin-hint">
          在 GitHub 创建「细粒度访问令牌」（Fine-grained PAT），仓库只选
          <strong> wholeshebe-cyber/tznb </strong>
          ，权限勾选 <strong>Contents: Read and write</strong>，然后把令牌粘贴到这里。
        </p>
        <div className="admin-field">
          <label>GitHub 密钥（Token）</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setTokenState(e.target.value)}
            placeholder="ghp_ 或 github_pat_ 开头的令牌"
          />
        </div>
        <div className="admin-row-btns">
          <button className="btn btn-accent" onClick={saveToken} disabled={busy || !token}>
            {busy ? "验证中…" : "保存并验证"}
          </button>
          <button className="btn" onClick={removeToken}>
            清除密钥
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h2>仓库设置</h2>
        <div className="admin-grid2">
          <div className="admin-field">
            <label>仓库（owner/repo）</label>
            <input value={repo} onChange={(e) => setRepo(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>分支</label>
            <input value={branch} onChange={(e) => setBranch(e.target.value)} />
          </div>
        </div>
        <button className="btn" onClick={saveGit}>
          保存仓库设置
        </button>
      </section>

      <section className="admin-card">
        <h2>修改管理密码</h2>
        <div className="admin-grid2">
          <div className="admin-field">
            <label>当前密码</label>
            <input
              type="password"
              value={curPwd}
              onChange={(e) => setCurPwd(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>新密码（至少 6 位）</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-accent" onClick={changePwd} disabled={busy}>
          修改密码
        </button>
      </section>

      <section className="admin-card">
        <h2>使用说明</h2>
        <ul className="admin-help">
          <li>上传 / 删除作品、编辑内容后，会自动提交到 GitHub，网站约 1-3 分钟后自动更新。</li>
          <li>GitHub 密钥只保存在当前浏览器里，不会上传到网站；请妥善保管。</li>
          <li>后台密码以加密形式保存在代码仓库中；真正的安全防线是 GitHub 密钥，泄露后请立刻到 GitHub 撤销。</li>
        </ul>
      </section>
    </div>
  );
}
