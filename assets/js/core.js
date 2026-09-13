/* 공통 데이터·경로·아이콘. 모든 경로는 이 스크립트 기준으로 계산합니다. */
const scriptLocation = new URL(import.meta.url);
export const ROOT = new URL("../../", scriptLocation);
export const url = (path) => new URL(path, ROOT).href;
export const MENUS = {
  manuals: {
    title: "매뉴얼 ON",
    short: "매뉴얼",
    page: "manual",
    icon: "book",
    color: "blue",
    description: "112신고 유형별 현장 대응 매뉴얼",
    detail: "신고 유형을 선택해 대응 절차·참고자료 확인",
    categories: [
      "주취자",
      "폭력",
      "절도",
      "실종",
      "가정폭력",
      "아동·청소년",
      "교통",
      "기타",
    ],
  },
  education: {
    title: "교육 ON",
    short: "교육",
    page: "education",
    icon: "education",
    color: "teal",
    description: "상시학습 교육자료 · 유형별 FTX",
    detail: "카드뉴스·직무교육 자료·FTX 시나리오 확인",
    categories: ["카드뉴스", "FTX", "직무교육", "기타"],
  },
  notices: {
    title: "알림 ON",
    short: "알림",
    page: "notice",
    icon: "megaphone",
    color: "amber",
    description: "긴급 전파사항 · 일반 공지사항",
    detail: "긴급 전파사항·공지·교육 일정 확인",
    categories: ["긴급", "일반"],
  },
  cases: {
    title: "사례 ON",
    short: "사례",
    page: "cases",
    icon: "clipboard",
    color: "violet",
    description: "우수사례 · 현장 대응사례 공유",
    detail: "사례별 발생 개요·주요 조치·시사점 확인",
    categories: ["우수사례", "미흡사례", "현장 대응사례"],
  },
};
const paths = {
  book: '<path d="M12 7c-3-3-7-3-10-2v14c4-1 7 0 10 2 3-2 6-3 10-2V5c-3-1-7-1-10 2Z"/><path d="M12 7v14M5 8h3M5 11h3M16 8h3M16 11h3"/>',
  education:
    '<path d="m2 6 10-4 10 4-10 4L2 6ZM5 8v4c4 3 10 3 14 0V8M22 6v6"/><rect x="3" y="15" width="18" height="7" rx="1"/><path d="m10 17 4 1.5-4 1.5Z"/>',
  megaphone:
    '<path d="m3 10 11-3 5-4v18l-5-4-11-3v-4ZM7 15l1 6h4l-2-5M14 7v10M22 8v8"/>',
  clipboard:
    '<rect x="4" y="4" width="16" height="18" rx="2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 11h8M8 15h5m1 4 2 2 4-5"/>',
  home: '<path d="m3 10 9-8 9 8v11h-6v-7H9v7H3V10Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5ZM14 2v6h5M8 12h8M8 16h6"/>',
  external: '<path d="M13 3h8v8M21 3l-12 12M10 3H3v18h18v-7"/>',
  pin: '<path d="m9 3 12 12-3 1-4-4-4 4-1-1-1-1 4-4-4-4 1-3ZM8 16l-5 5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9 21h6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 3 6 6-12 12H3v-6L15 3ZM12 6l6 6"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
};
export function icon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
}
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const displayDate = (date) => String(date || "").replaceAll("-", ".");
export function isNew(date) {
  const now = new Date(),
    today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const day = Date.parse(`${date}T00:00:00Z`),
    age = (today - day) / 86400000;
  return age >= 0 && age <= 14;
}
export function safeAsset(path) {
  if (typeof path !== "string" || !path.trim()) return null;
  const p = path.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) {
    try {
      const parsed = new URL(p);
      return parsed.protocol === "https:" ? parsed.href : null;
    } catch {
      return null;
    }
  }
  if (p.startsWith("/") || p.includes("\\")) return null;
  try {
    const target = new URL(p, ROOT);
    return target.origin === ROOT.origin &&
      target.pathname.startsWith(ROOT.pathname)
      ? target.href
      : null;
  } catch {
    return null;
  }
}
export const postURL = (post) =>
  url(`pages/${MENUS[post.menu].page}.html?id=${encodeURIComponent(post.id)}`);
export function validateRecords(data) {
  if (!Array.isArray(data))
    throw new Error("게시물은 [ ]로 감싼 목록이어야 합니다.");
  const seen = new Set();
  data.forEach((p, i) => {
    const line = `${i + 1}번째 게시물`;
    if (!p || typeof p !== "object" || Array.isArray(p))
      throw new Error(`${line}: 게시물 형식이 올바르지 않습니다.`);
    for (const key of ["id", "title", "category", "date"])
      if (typeof p[key] !== "string" || !p[key].trim())
        throw new Error(`${line}: ${key} 값을 확인하세요.`);
    if (!/^[a-zA-Z0-9_-]+$/.test(p.id))
      throw new Error(
        `${line}: id는 영문·숫자·하이픈·밑줄만 사용할 수 있습니다.`,
      );
    if (seen.has(p.id)) throw new Error(`${line}: id가 중복됩니다 (${p.id}).`);
    seen.add(p.id);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(p.date) ||
      Number.isNaN(Date.parse(p.date)) ||
      new Date(p.date).toISOString().slice(0, 10) !== p.date
    )
      throw new Error(
        `${line}: 날짜는 YYYY-MM-DD 형식의 실제 날짜여야 합니다.`,
      );
    for (const key of ["important", "sample"])
      if (p[key] !== undefined && typeof p[key] !== "boolean")
        throw new Error(`${line}: ${key}는 true 또는 false여야 합니다.`);
    for (const key of [
      "summary",
      "content",
      "file",
      "overview",
      "actions",
      "lessons",
    ])
      if (p[key] !== undefined && typeof p[key] !== "string")
        throw new Error(`${line}: ${key}는 문자열이어야 합니다.`);
    for (const key of ["tags", "images"])
      if (
        p[key] !== undefined &&
        (!Array.isArray(p[key]) || p[key].some((x) => typeof x !== "string"))
      )
        throw new Error(`${line}: ${key}는 문자열 목록이어야 합니다.`);
    if (p.file && !safeAsset(p.file))
      throw new Error(`${line}: 첨부파일 경로를 확인하세요.`);
    if ((p.images || []).some((x) => !safeAsset(x)))
      throw new Error(`${line}: 이미지 경로를 확인하세요.`);
    if (p.attachments !== undefined) {
      if (
        !Array.isArray(p.attachments) ||
        p.attachments.some(
          (a) => !a || typeof a.name !== "string" || !safeAsset(a.path),
        )
      )
        throw new Error(`${line}: 추가 첨부자료 형식을 확인하세요.`);
    }
  });
  return data;
}
export async function loadMenu(key) {
  const response = await fetch(url(`data/${key}.json`), { cache: "no-store" });
  if (!response.ok) throw new Error("자료 파일을 불러오지 못했습니다.");
  return validateRecords(await response.json()).map((p) => ({
    ...p,
    menu: key,
  }));
}
export async function loadAll() {
  const keys = Object.keys(MENUS),
    result = await Promise.allSettled(keys.map(loadMenu));
  return {
    posts: result.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
    errors: keys.filter((_, i) => result[i].status === "rejected"),
  };
}
export function sorted(posts) {
  return [...posts].sort(
    (a, b) =>
      Number(!!b.important) - Number(!!a.important) ||
      b.date.localeCompare(a.date) ||
      a.id.localeCompare(b.id),
  );
}
export function searchPosts(posts, query) {
  const words = query
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return posts.filter((p) => {
    const hay = [
      p.title,
      p.summary,
      p.content,
      p.category,
      p.overview,
      p.actions,
      p.lessons,
      ...(p.tags || []),
    ]
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase("ko");
    return words.every((word) => hay.includes(word));
  });
}
export function badges(p) {
  return `${p.category === "긴급" ? '<span class="badge urgent">긴급</span>' : ""}${p.important ? '<span class="badge pinned">중요</span>' : ""}${isNew(p.date) ? '<span class="badge new">NEW</span>' : ""}${p.file && /\.pdf(?:[?#]|$)/i.test(p.file) ? '<span class="badge pdf">PDF</span>' : ""}`;
}
export function shell(active = "home") {
  const nav = [
    ["home", { title: "홈", page: null, icon: "home", short: "홈" }],
    ...Object.entries(MENUS),
  ];
  const navMarkup = (mobile) =>
    nav
      .map(
        ([key, m]) =>
          `<a href="${key === "home" ? url("index.html") : url(`pages/${m.page}.html`)}" ${active === key ? 'aria-current="page"' : ""}>${mobile ? icon(m.icon) : ""}<span>${mobile ? m.short : m.title}</span></a>`,
      )
      .join("");
  document.querySelector("#site-header").innerHTML =
    `<div class="institution-bar"><div class="container"><span>청주상당경찰서</span><span class="institution-caption">지역경찰 교육·현장지원</span></div></div><div class="brand-bar"><div class="container brand-inner"><a class="brand" href="${url("index.html")}"><img src="${url("assets/images/logo.png")}" alt="청주상당경찰서 CI" width="64" height="64"><span><strong>상당 현장 <em>ON</em></strong><span class="subtitle">지역경찰 대응역량 강화를 위한<br class="mobile-break"> 웹 기반 교육·현장지원 플랫폼</span></span></a><span class="brand-side">함께 배우고, 현장에 더하다</span></div></div><nav class="desktop-nav" aria-label="주 메뉴"><div class="container">${navMarkup(false)}</div></nav>`;
  document.querySelector("#site-footer").innerHTML =
    `<div class="container footer-inner"><div><strong>청주상당경찰서</strong><p>상당 현장 ON · 지역경찰 교육·현장지원 플랫폼</p></div><a class="operator-link" href="${url("tools/editor.html")}">${icon("edit")} 게시물 편집 도우미</a></div><nav class="mobile-nav" aria-label="하단 메뉴">${navMarkup(true)}</nav>`;
}
