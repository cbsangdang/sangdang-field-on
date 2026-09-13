/* 서버·로그인 없이 JSON을 작성하는 도우미. 다운로드 전 데이터는 메모리에만 보관합니다. */
import {
  MENUS,
  loadMenu,
  validateRecords,
  escapeHTML as esc,
  shell,
} from "./core.js";
shell("editor");
const menuSelect = document.querySelector("#editor-menu"),
  form = document.querySelector("#post-form"),
  fields = document.querySelector("#editor-fields");
const status = document.querySelector("#editor-status"),
  list = document.querySelector("#editor-posts"),
  download = document.querySelector("#download-json");
let key = "manuals",
  records = [],
  selected = -1,
  dirtyForm = false,
  dirtyList = false,
  loading = false;
const byName = (name) => form.elements.namedItem(name);
const attachmentRows = document.querySelector("#attachment-rows");
let attachmentSequence = 0;
function addAttachment(attachment = {}) {
  const id = `attachment-${++attachmentSequence}`;
  const row = document.createElement("div");
  row.className = "attachment-row";
  row.innerHTML = `
    <label for="${id}-name">자료 이름
      <input id="${id}-name" class="attachment-name" placeholder="예: 교육 활동지 또는 me01" aria-describedby="attachment-help" />
    </label>
    <label for="${id}-path">파일 경로
      <input id="${id}-path" class="attachment-path" placeholder="예: files/education/me01.pdf" spellcheck="false" aria-describedby="attachment-help" />
    </label>
    <button class="btn secondary danger-text remove-attachment" type="button">삭제</button>`;
  const nameInput = row.querySelector(".attachment-name");
  const pathInput = row.querySelector(".attachment-path");
  nameInput.value = attachment.name || "";
  pathInput.value = attachment.path || "";
  const remove = row.querySelector(".remove-attachment");
  const labelRemove = () => remove.setAttribute("aria-label", `${nameInput.value.trim() || "이"} 첨부자료 삭제`);
  labelRemove();
  nameInput.addEventListener("input", labelRemove);
  remove.addEventListener("click", () => {
    const next = row.nextElementSibling || row.previousElementSibling;
    row.remove();
    dirtyForm = true;
    (next?.querySelector(".attachment-name") || document.querySelector("#add-attachment")).focus();
  });
  attachmentRows.append(row);
  return nameInput;
}
function say(message, error = false) {
  status.hidden = false;
  status.textContent = message;
  status.classList.toggle("is-error", error);
}
function confirmLoss(message) {
  return (!dirtyForm && !dirtyList) || confirm(message);
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function refreshList() {
  list.innerHTML =
    records
      .map(
        (p, i) =>
          `<button type="button" data-index="${i}" class="${selected === i ? "selected" : ""}" ${selected === i ? 'aria-current="true"' : ""}>${esc(p.title)}</button>`,
      )
      .join("") || '<p class="editor-help">등록된 게시물이 없습니다.</p>';
  list.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (
        dirtyForm &&
        !confirm(
          "작성 중인 내용을 버리고 다른 게시물을 열까요? 먼저 목록에 반영하면 내용을 유지할 수 있습니다.",
        )
      )
        return;
      fill(Number(btn.dataset.index));
    }),
  );
  document.querySelector("#dataset-label").textContent =
    `${key}.json · ${records.length}건${dirtyList ? " · 변경내용 다운로드 필요" : ""}`;
}
function fill(index) {
  selected = index;
  form.reset();
  const p =
    index < 0
      ? {
          date: today(),
          id: `${key === "manuals" ? "manual" : key === "notices" ? "notice" : key === "cases" ? "case" : "education"}-${Date.now().toString(36)}`,
          category: MENUS[key].categories[0],
        }
      : records[index];
  for (const name of [
    "id",
    "title",
    "category",
    "date",
    "summary",
    "content",
    "file",
    "overview",
    "actions",
    "lessons",
  ])
    byName(name).value = p[name] || "";
  for (const name of ["important", "sample"]) byName(name).checked = !!p[name];
  byName("images").value = (p.images || []).join("\n");
  byName("tags").value = (p.tags || []).join(", ");
  attachmentRows.replaceChildren();
  if (p.attachments?.length) p.attachments.forEach(addAttachment);
  else addAttachment();
  byName("id").readOnly = index >= 0;
  document
    .querySelectorAll(".case-only")
    .forEach((el) => (el.hidden = key !== "cases"));
  document.querySelector("#category-options").innerHTML = MENUS[key].categories
    .map((c) => `<option value="${esc(c)}"></option>`)
    .join("");
  document.querySelector("#editor-heading").textContent =
    index < 0 ? "새 게시물 작성" : "게시물 수정";
  document.querySelector("#delete-post").disabled = index < 0;
  document.querySelector("#editor-preview").hidden = true;
  status.hidden = true;
  dirtyForm = false;
  refreshList();
}
function collect() {
  const p = selected >= 0 ? { ...records[selected] } : {};
  for (const name of [
    "id",
    "title",
    "category",
    "date",
    "summary",
    "content",
    "file",
  ])
    p[name] = byName(name).value.trim();
  for (const name of ["important", "sample"]) p[name] = byName(name).checked;
  if (key === "cases")
    for (const name of ["overview", "actions", "lessons"])
      p[name] = byName(name).value.trim();
  p.images = byName("images")
    .value.split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
  p.tags = byName("tags")
    .value.split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  p.attachments = [];
  attachmentRows.querySelectorAll(".attachment-row").forEach((row, index) => {
    const nameInput = row.querySelector(".attachment-name");
    const pathInput = row.querySelector(".attachment-path");
    const name = nameInput.value.trim(), path = pathInput.value.trim();
    if (!name && !path) return;
    if (!name || !path) {
      (!name ? nameInput : pathInput).focus();
      throw new Error(`· 추가 첨부자료 ${index + 1}번의 ${!name ? "자료 이름을" : "파일 경로를"} 입력\n· 필요 없는 자료는 해당 줄의 ‘삭제’ 선택`);
    }
    p.attachments.push({ name, path });
  });
  return p;
}
function commitForm() {
  if (!form.reportValidity()) return false;
  try {
    const p = collect(),
      next = [...records];
    if (selected < 0) next.unshift(p);
    else next[selected] = p;
    validateRecords(next);
    records = next;
    selected = selected < 0 ? 0 : selected;
    dirtyList = true;
    fill(selected);
    say(
      "· 작업 목록에 반영 완료\n· 다음 단계: ‘JSON 다운로드’ 후 GitHub에 업로드",
    );
    return true;
  } catch (error) {
    say(error.message, true);
    return false;
  }
}
async function changeMenu(nextKey) {
  loading = true;
  fields.disabled = true;
  download.disabled = true;
  menuSelect.disabled = true;
  document.querySelector("#new-post").disabled = true;
  document.querySelector("#import-json").disabled = true;
  key = nextKey;
  records = [];
  selected = -1;
  dirtyForm = false;
  dirtyList = false;
  list.innerHTML = "";
  document.querySelector("#dataset-label").textContent =
    "게시물 목록 불러오는 중";
  try {
    records = (await loadMenu(key)).map(({ menu, ...p }) => p);
    fill(records.length ? 0 : -1);
    fields.disabled = false;
    download.disabled = false;
  } catch {
    form.reset();
    say(
      "· 기존 게시물 목록을 읽지 못해 편집 중지\n· ‘저장해 둔 JSON 불러오기’에서 정상 파일 선택",
      true,
    );
    document.querySelector("#dataset-label").textContent =
      `${key}.json 확인 필요`;
  } finally {
    loading = false;
    menuSelect.disabled = false;
    document.querySelector("#import-json").disabled = false;
    document.querySelector("#new-post").disabled = fields.disabled;
  }
}
menuSelect.addEventListener("change", () => {
  if (
    !confirmLoss(
      "현재 메뉴의 변경내용을 내려받지 않았다면 사라집니다. 다른 메뉴로 이동할까요?",
    )
  ) {
    menuSelect.value = key;
    return;
  }
  changeMenu(menuSelect.value);
});
form.addEventListener("input", () => {
  dirtyForm = true;
});
document.querySelector("#add-attachment").addEventListener("click", () => {
  addAttachment().focus();
  dirtyForm = true;
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  commitForm();
});
document.querySelector("#new-post").addEventListener("click", () => {
  if (dirtyForm && !confirm("작성 중인 내용을 버리고 새 게시물을 작성할까요?"))
    return;
  fill(-1);
  byName("title").focus();
});
document.querySelector("#preview-post").addEventListener("click", () => {
  const preview = document.querySelector("#editor-preview");
  try {
    const p = collect();
    preview.innerHTML = `<h3>${esc(p.title || "제목 없음")}</h3><p>${esc(p.summary)}</p><div class="prose">${esc(p.content)}</div>${[
      ["overview", "발생 개요"],
      ["actions", "주요 조치"],
      ["lessons", "시사점"],
    ]
      .map(([k, t]) => (p[k] ? `<h3>${t}</h3><p>${esc(p[k])}</p>` : ""))
      .join(
        "",
      )}<p class="editor-help">· 첨부자료 확인: 실제 파일을 GitHub에 올린 뒤 게시물에서 열기</p>`;
    preview.hidden = false;
  } catch (error) {
    say(error.message, true);
  }
});
document.querySelector("#delete-post").addEventListener("click", () => {
  if (selected < 0) return;
  if (
    !confirm(
      `‘${records[selected].title}’ 게시물을 현재 작업 목록에서 삭제할까요? GitHub에 올리기 전까지 실제 사이트는 바뀌지 않습니다.`,
    )
  )
    return;
  records.splice(selected, 1);
  dirtyList = true;
  fill(records.length ? 0 : -1);
  say(
    "· 작업 목록에서 삭제 완료\n· 사이트에 반영하려면 JSON 다운로드 후 GitHub에 업로드",
  );
});
download.addEventListener("click", () => {
  if (loading) return;
  if (dirtyForm) {
    say("· 작성 중인 내용은 먼저 ‘목록에 반영’ 선택\n· 반영 후 ‘JSON 다운로드’ 선택", true);
    return;
  }
  try {
    validateRecords(records);
    const blob = new Blob([JSON.stringify(records, null, 2) + "\n"], {
        type: "application/json;charset=utf-8",
      }),
      blobURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobURL;
    a.download = `${key}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobURL), 30000);
    dirtyList = false;
    refreshList();
    say(
      `· ${key}.json 다운로드 요청 완료\n· 내려받은 파일 확인 후 GitHub의 data 폴더에 같은 이름으로 업로드`,
    );
  } catch (error) {
    say(error.message, true);
  }
});
document
  .querySelector("#import-json")
  .addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !confirmLoss(
        "불러온 파일로 현재 작업 목록을 교체할까요? 다운로드하지 않은 변경내용은 사라집니다.",
      )
    ) {
      event.target.value = "";
      return;
    }
    try {
      const next = validateRecords(JSON.parse(await file.text()));
      records = next;
      dirtyList = true;
      fields.disabled = false;
      download.disabled = false;
      document.querySelector("#new-post").disabled = false;
      fill(records.length ? 0 : -1);
      say(
        `· 게시물 ${records.length}건 불러오기 완료\n· 선택한 메뉴가 ${MENUS[key].title}인지 확인`,
      );
    } catch (error) {
      say(`불러오기 실패: ${error.message}`, true);
    } finally {
      event.target.value = "";
    }
  });
window.addEventListener("beforeunload", (event) => {
  if (dirtyForm || dirtyList) {
    event.preventDefault();
    event.returnValue = "";
  }
});
changeMenu(key);
