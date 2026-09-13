import {
  MENUS,
  url,
  icon,
  escapeHTML as esc,
  displayDate,
  isNew,
  postURL,
  safeAsset,
  loadAll,
  sorted,
  searchPosts,
  badges,
  shell,
} from "./core.js";

const kind = document.body.dataset.page,
  main = document.querySelector("#main");
const params = new URLSearchParams(location.search);
const query = params.get("q") || "",
  category = params.get("category") || "전체",
  sort = params.get("sort") || "important";
shell(MENUS[kind] ? kind : "home");

function breadcrumb(label) {
  return `<div class="breadcrumb"><a href="${url("index.html")}">홈</a>${icon("arrow")}<span>${esc(label)}</span></div>`;
}
function searchForm(
  action,
  placeholder = "제목, 본문, 분야, 태그로 검색",
  value = "",
) {
  return `<form class="search-form" role="search" action="${url(action)}"><label for="search-input"><span class="sr-only">검색어</span>${icon("search")}</label><input id="search-input" type="search" name="q" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off" maxlength="150"><button type="submit">검색</button>${category !== "전체" ? `<input type="hidden" name="category" value="${esc(category)}">` : ""}</form>`;
}
function empty(title, text, href, label = "전체 자료 보기") {
  return `<div class="empty-state">${icon("search")}<h2>${esc(title)}</h2><p>${esc(text)}</p><a class="btn secondary" href="${href}">${esc(label)}</a></div>`;
}
function sampleNote() {
  return `<div class="sample-note">${icon("file")}<span>기능 확인용 가상 예시 · 실제 지침·사건·교육 일정 아님</span></div>`;
}
function detailHref(p) {
  const target = new URL(postURL(p));
  if (kind === "search") {
    target.searchParams.set("from", "search");
    if (query) target.searchParams.set("q", query);
    if (category !== "전체") target.searchParams.set("category", category);
  } else if (kind === p.menu)
    for (const key of ["q", "category", "sort", "page"])
      if (params.has(key)) target.searchParams.set(key, params.get(key));
  return target.href;
}
function row(p) {
  const menu = MENUS[p.menu];
  return `<a class="post-row" href="${detailHref(p)}"><div class="row-icon">${icon(menu.icon)}</div><div class="post-info"><div><span class="category">${kind === "search" ? esc(menu.title) + " · " : ""}${esc(p.category)}</span><span class="badges">${badges(p)}</span></div><h3>${esc(p.title)}</h3>${p.summary ? `<p>${esc(p.summary)}</p>` : ""}<div class="meta"><time datetime="${esc(p.date)}">${displayDate(p.date)}</time>${p.sample ? "<span>가상 예시</span>" : ""}${p.images?.length ? `<span>이미지 ${p.images.length}장</span>` : ""}${p.file ? "<span>첨부자료</span>" : ""}</div></div>${icon("arrow", "row-arrow")}</a>`;
}
function parameterURL(key, value) {
  const target = new URL(location.href);
  target.searchParams.delete("id");
  target.searchParams.delete("page");
  if (value && value !== "전체") target.searchParams.set(key, value);
  else target.searchParams.delete(key);
  return target.href;
}
function filters(options) {
  return `<div class="filter-list" role="group" aria-label="분류 필터">${options.map((c) => `<button class="filter-chip" type="button" data-category="${esc(c)}" aria-pressed="${category === c}">${esc(c)}</button>`).join("")}</div>`;
}
function bindFilters() {
  document
    .querySelectorAll("[data-category]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        location.assign(parameterURL("category", btn.dataset.category)),
      ),
    );
  document
    .querySelector("#sort-select")
    ?.addEventListener("change", (event) =>
      location.assign(parameterURL("sort", event.target.value)),
    );
}
function listMeta(count) {
  return `<div class="list-meta"><span>총 <strong>${count}</strong>건${query ? ` · ‘${esc(query)}’ 검색결과` : ""}</span><label class="sr-only" for="sort-select">정렬 방식</label><select id="sort-select"><option value="important" ${sort === "important" ? "selected" : ""}>중요순 · 최신순</option><option value="latest" ${sort === "latest" ? "selected" : ""}>최신순</option><option value="title" ${sort === "title" ? "selected" : ""}>제목순</option></select></div>`;
}
function order(posts) {
  if (sort === "latest")
    return [...posts].sort((a, b) => b.date.localeCompare(a.date));
  if (sort === "title")
    return [...posts].sort((a, b) => a.title.localeCompare(b.title, "ko"));
  return sorted(posts);
}
function paged(posts) {
  const size = 10,
    total = Math.max(1, Math.ceil(posts.length / size));
  const page = Math.max(
    1,
    Math.min(total, Number.parseInt(params.get("page") || "1", 10) || 1),
  );
  return { posts: posts.slice((page - 1) * size, page * size), page, total };
}
function pagination(page, total) {
  if (total <= 1) return "";
  return `<nav class="pagination" aria-label="게시물 페이지">${Array.from(
    { length: total },
    (_, i) => {
      const u = new URL(location.href);
      u.searchParams.set("page", i + 1);
      return `<a href="${u.href}" ${page === i + 1 ? 'aria-current="page"' : ""}>${i + 1}</a>`;
    },
  ).join("")}</nav>`;
}
function errorBanner(keys) {
  return keys.length
    ? `<div class="error-banner" role="alert">${keys.map((k) => MENUS[k].title).join(", ")} 자료를 불러오지 못했습니다.<ul class="help-list"><li>잠시 후 새로고침해 다시 확인</li><li>같은 문제가 계속되면 운영 담당자에게 문의</li></ul></div>`
    : "";
}
function renderHome(posts, errors) {
  const important = sorted(
    posts.filter(
      (p) => p.menu === "notices" && (p.important || p.category === "긴급"),
    ),
  ).slice(0, 2);
  const recent = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  main.innerHTML = `<section class="search-panel" aria-labelledby="search-heading"><div class="search-intro"><p class="eyebrow">SANGDANG FIELD ON</p><h1 id="search-heading">어떤 자료를 찾으시나요?</h1></div><div class="search-panel-body">${searchForm("pages/search.html", "매뉴얼, 교육, 알림, 사례 통합검색")}<div class="search-hints"><span>빠른 검색</span>${["주취자", "실종", "FTX"].map((t) => `<a href="${url("pages/search.html")}?q=${encodeURIComponent(t)}">#${t}</a>`).join("")}</div></div></section>${errorBanner(errors)}<div class="home-layout"><section aria-labelledby="core-heading"><div class="section-title"><h2 id="core-heading">핵심 메뉴</h2><span>현장 대응부터 사례 공유까지</span></div><div class="menu-stack">${Object.entries(
    MENUS,
  )
    .map(
      ([key, m]) =>
        `<a class="menu-card ${m.color}" href="${url(`pages/${m.page}.html`)}"><div class="menu-symbol">${icon(m.icon)}</div><div><h3>${m.short === "매뉴얼" ? "매뉴얼" : m.short} <em>ON</em></h3><p>${m.description}</p><span class="menu-count">${errors.includes(key) ? "자료 확인 필요" : `자료 ${posts.filter((p) => p.menu === key).length}건`}</span></div>${icon("arrow", "card-arrow")}</a>`,
    )
    .join(
      "",
    )}</div></section><aside class="side-column" aria-label="주요 게시물"><section class="notice-box"><div class="section-title"><h2>${icon("bell")} 꼭 확인하세요</h2><a href="${url("pages/notice.html")}">전체보기 ${icon("arrow")}</a></div>${important.length ? important.map((p) => `<a class="notice-link" href="${postURL(p)}"><span class="badges">${badges(p)}</span><strong>${esc(p.title)}</strong><div class="meta"><time datetime="${p.date}">${displayDate(p.date)}</time>${p.sample ? "<span>가상 예시</span>" : ""}</div></a>`).join("") : '<p class="editor-note">등록된 중요 공지가 없습니다.</p>'}</section><section><div class="section-title"><h2>최근 등록 자료</h2><a href="${url("pages/search.html")}">전체보기 ${icon("arrow")}</a></div><div class="recent-box">${recent.length ? recent.map((p) => `<a class="recent-row" href="${postURL(p)}"><div class="meta"><span class="menu-tag ${MENUS[p.menu].color}">${MENUS[p.menu].title}</span><time datetime="${p.date}">${displayDate(p.date)}</time></div><h3>${esc(p.title)}</h3></a>`).join("") : '<p class="editor-note">등록된 자료가 없습니다.</p>'}</div></section></aside></div>${posts.some((p) => p.sample) ? sampleNote() : ""}`;
}
function renderList(posts, errors) {
  const isSearch = kind === "search",
    menu = MENUS[kind];
  const title = isSearch ? "통합검색" : menu.title,
    action = isSearch ? "pages/search.html" : `pages/${menu.page}.html`;
  let relevant = isSearch ? posts : posts.filter((p) => p.menu === kind);
  const cats = isSearch
    ? ["전체", ...Object.values(MENUS).map((m) => m.title)]
    : [
        "전체",
        ...new Set([...menu.categories, ...relevant.map((p) => p.category)]),
      ];
  const filtered = order(
    searchPosts(relevant, query).filter(
      (p) =>
        category === "전체" ||
        (isSearch ? MENUS[p.menu].title === category : p.category === category),
    ),
  );
  const pageData = paged(filtered);
  main.innerHTML = `${breadcrumb(title)}<div class="page-heading"><div><h1>${title}</h1><p>${isSearch ? "제목·본문·분야·태그로 4대 메뉴 자료를 한 번에 검색" : menu.detail}</p></div><div class="page-heading-icon">${icon(isSearch ? "search" : menu.icon)}</div></div>${errorBanner(isSearch ? errors : errors.filter((k) => k === kind))}<section class="list-controls" aria-label="자료 검색 및 필터">${searchForm(action, isSearch ? "찾을 자료의 검색어 입력" : "이 메뉴에서 검색", query)}${filters(cats)}</section>${listMeta(filtered.length)}${filtered.length ? (kind === "notices" ? noticeTable(pageData.posts, relevant) : `<div class="posts-list">${pageData.posts.map(row).join("")}</div>`) : empty("찾으시는 자료가 없습니다.", "검색어를 바꾸거나 다른 분류를 선택해 다시 검색", url(action))}${pagination(pageData.page, pageData.total)}`;
  bindFilters();
}
function noticeTable(posts, all) {
  const chronological = [...all].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
  return `<div class="posts-list"><table class="notice-table"><caption class="sr-only">알림 ON 게시물 목록</caption><thead><tr><th scope="col">번호</th><th scope="col">구분</th><th scope="col">제목</th><th scope="col">등록일</th></tr></thead><tbody>${posts.map((p) => `<tr class="${p.important ? "pinned-row" : ""}"><td class="notice-number">${p.important ? `${icon("pin")}<span class="sr-only">상단 고정</span>` : chronological.findIndex((x) => x.id === p.id) + 1}</td><td>${p.category === "긴급" ? '<span class="badge urgent">긴급</span>' : esc(p.category)}</td><td><a class="notice-title" href="${detailHref(p)}">${esc(p.title)}</a><span class="table-badges">${p.important ? '<span class="badge pinned">중요</span>' : ""}${isNew(p.date) ? '<span class="badge new">NEW</span>' : ""}${p.sample ? '<span class="badge sample">예시</span>' : ""}</span></td><td class="notice-date"><time datetime="${p.date}">${displayDate(p.date)}</time></td></tr>`).join("")}</tbody></table></div>`;
}
function renderDetail(posts, errors) {
  const p = posts.find((p) => p.menu === kind && p.id === params.get("id"));
  const backParams = new URLSearchParams(params);
  backParams.delete("id");
  backParams.delete("from");
  const backURL =
    url(
      `pages/${params.get("from") === "search" ? "search" : MENUS[kind].page}.html`,
    ) + (backParams.size ? "?" + backParams.toString() : "");
  if (!p) {
    main.innerHTML = `${breadcrumb(MENUS[kind].title)}${errorBanner(errors.filter((k) => k === kind))}${empty("게시물을 찾을 수 없습니다.", "삭제되었거나 주소가 바뀐 자료일 수 있음 · 목록에서 다시 확인", url(`pages/${MENUS[kind].page}.html`), "목록으로 이동")}`;
    return;
  }
  document.title = `${p.title} | 상당 현장 ON`;
  const attachments = [
    ...(p.file
      ? [
          {
            name: /\.pdf(?:[?#]|$)/i.test(p.file) ? "PDF 보기" : "자료 열기",
            path: p.file,
          },
        ]
      : []),
    ...(p.attachments || []),
  ].filter((a) => safeAsset(a.path));
  main.innerHTML = `<div class="detail"><a class="back-link" href="${backURL}">${icon("back")} ${params.get("from") === "search" ? "검색결과로" : "목록으로"}</a><article class="article"><header class="article-header"><div class="badges"><span class="menu-tag ${MENUS[kind].color}">${MENUS[kind].title} · ${esc(p.category)}</span>${badges(p)}</div><h1>${esc(p.title)}</h1><div class="meta"><time datetime="${p.date}">등록일 ${displayDate(p.date)}</time>${p.sample ? "<span>가상 예시</span>" : ""}</div></header><div class="article-body">${p.sample ? sampleNote() : ""}${p.summary ? `<div class="article-summary">${esc(p.summary)}</div>` : ""}${p.content ? `<div class="prose">${esc(p.content)}</div>` : ""}${[
    ["overview", "발생 개요"],
    ["actions", "주요 조치"],
    ["lessons", "시사점"],
  ]
    .map(([key, title]) =>
      p[key]
        ? `<section class="article-section"><h2>${title}</h2><div class="prose">${esc(p[key])}</div></section>`
        : "",
    )
    .join(
      "",
    )}${p.images?.length ? gallery(p) : ""}${attachments.length ? `<section class="attachments"><h2>첨부자료</h2><div class="attachment-links">${attachments.map((a) => `<a class="btn secondary" href="${safeAsset(a.path)}" target="_blank" rel="noopener noreferrer">${icon("file")}${esc(a.name)} ${icon("external")}<span class="sr-only">새 탭에서 열기</span></a>`).join("")}</div></section>` : ""}${p.tags?.length ? `<div class="tags" aria-label="게시물 태그">${p.tags.map((t) => `<a href="${url("pages/search.html")}?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join("")}</div>` : ""}</div></article><div class="detail-actions"><a class="btn secondary" href="${backURL}">${icon("back")} 목록으로</a><a class="btn" href="${url("index.html")}">${icon("home")} 홈으로</a></div></div>`;
  if (p.images?.length) bindGallery();
}
function gallery(p) {
  return `<section class="gallery-section"><div class="gallery-heading"><h2>이미지 자료 <span class="meta">${p.images.length}장</span></h2><button id="gallery-layout" aria-pressed="false" type="button">아래로 모두 보기</button></div><div class="gallery-track" id="gallery-track" tabindex="0" role="region" aria-label="이미지 자료. 좌우 화살표 키 또는 화면을 밀어 이동">${p.images.map((path, i) => `<figure><a href="${safeAsset(path)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.title)} ${i + 1}번째 이미지 원본 열기"><img src="${safeAsset(path)}" alt="${esc(p.title)} · ${i + 1}/${p.images.length}번째 이미지" loading="${i === 0 ? "eager" : "lazy"}"></a><figcaption>${i + 1} / ${p.images.length} · 원본을 보려면 이미지 선택</figcaption></figure>`).join("")}</div><div class="gallery-controls" id="gallery-controls"><button type="button" id="gallery-prev" aria-label="이전 이미지">${icon("back")}</button><span class="gallery-status" id="gallery-status" aria-live="polite">1 / ${p.images.length}</span><button type="button" id="gallery-next" aria-label="다음 이미지">${icon("arrow")}</button></div></section>`;
}
function bindGallery() {
  const track = document.querySelector("#gallery-track"),
    figures = [...track.children],
    previous = document.querySelector("#gallery-prev"),
    next = document.querySelector("#gallery-next"),
    status = document.querySelector("#gallery-status");
  let index = 0,
    stacked = false;
  const sync = () => {
    if (stacked) return;
    const left = track.getBoundingClientRect().left;
    index = figures.reduce(
      (best, el, i) =>
        Math.abs(el.getBoundingClientRect().left - left) <
        Math.abs(figures[best].getBoundingClientRect().left - left)
          ? i
          : best,
      0,
    );
    previous.disabled = index === 0;
    next.disabled = index === figures.length - 1;
    status.textContent = `${index + 1} / ${figures.length}`;
  };
  const move = (n) => {
    const i = Math.max(0, Math.min(figures.length - 1, index + n));
    track.scrollTo({
      left: figures[i].offsetLeft - figures[0].offsetLeft,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener("scroll", sync, { passive: true });
  track.addEventListener("keydown", (e) => {
    if (!stacked && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      move(e.key === "ArrowLeft" ? -1 : 1);
    }
  });
  document
    .querySelector("#gallery-layout")
    .addEventListener("click", (event) => {
      stacked = !stacked;
      track.classList.toggle("stacked", stacked);
      event.target.setAttribute("aria-pressed", stacked);
      event.target.textContent = stacked
        ? "좌우로 넘겨 보기"
        : "아래로 모두 보기";
      document.querySelector("#gallery-controls").hidden = stacked;
      if (!stacked) {
        track.scrollLeft = 0;
        sync();
      }
    });
  sync();
}

async function start() {
  try {
    const { posts, errors } = await loadAll();
    if (kind === "home") renderHome(posts, errors);
    else if (params.has("id") && MENUS[kind]) renderDetail(posts, errors);
    else renderList(posts, errors);
  } catch (error) {
    main.innerHTML = empty(
      "화면을 불러오지 못했습니다.",
      "새로고침 후 다시 확인",
      url("index.html"),
      "홈으로 이동",
    );
    console.error(error);
  }
  main.setAttribute("aria-busy", "false");
}
start();
