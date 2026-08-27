const TOKEN_KEY = "tznb_gh_token";
const SETTINGS_KEY = "tznb_admin_settings";
const HASH_KEY = "tznb_admin_hash";
const AUTH_KEY = "tznb_admin_auth";

const GH_API = "https://api.github.com";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getSettings(defaults) {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      repo: saved.repo || defaults.repo,
      branch: saved.branch || defaults.branch,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getEffectiveHash(defaultHash) {
  return localStorage.getItem(HASH_KEY) || defaultHash;
}

export function setEffectiveHash(hash) {
  localStorage.setItem(HASH_KEY, hash);
}

export function setAuthed(v) {
  if (v) sessionStorage.setItem(AUTH_KEY, "1");
  else sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function ghRequest(path, { method = "GET", token, body } = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.message || "";
    } catch {
      /* ignore */
    }
    throw new Error(`GitHub 请求失败 (${res.status})：${detail || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function testToken(token) {
  const user = await ghRequest("/user", { token });
  if (!user) throw new Error("无法验证密钥");
  return user.login;
}

export async function getFile(repo, branch, path) {
  const data = await ghRequest(
    `/repos/${repo}/contents/${path}?ref=${branch}`
  );
  if (!data) return null;
  const content = decodeURIComponent(
    escape(atob(data.content.replace(/\n/g, "")))
  );
  return { content, sha: data.sha };
}

export async function listDir(repo, branch, path) {
  const data = await ghRequest(
    `/repos/${repo}/contents/${path}?ref=${branch}`
  );
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    path: item.path,
    size: item.size,
    type: item.type,
    sha: item.sha,
  }));
}

export async function putFile(repo, branch, path, content, message, sha) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;
  return ghRequest(`/repos/${repo}/contents/${path}`, {
    method: "PUT",
    token: getToken(),
    body,
  });
}

export async function putBinary(repo, branch, path, base64, message, sha) {
  const body = {
    message,
    content: base64,
    branch,
  };
  if (sha) body.sha = sha;
  return ghRequest(`/repos/${repo}/contents/${path}`, {
    method: "PUT",
    token: getToken(),
    body,
  });
}

export async function deleteFile(repo, branch, path, sha, message) {
  return ghRequest(`/repos/${repo}/contents/${path}`, {
    method: "DELETE",
    token: getToken(),
    body: { message, sha, branch },
  });
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

export function sanitizeFileName(name) {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "作品";
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
