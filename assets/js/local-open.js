/* 파일을 더블클릭한 경우에도 실행 방법을 확인할 수 있는 일반 스크립트입니다. */
(() => {
  if (window.location.protocol !== "file:") return;
  const main = document.querySelector("#main");
  if (!main) return;
  main.removeAttribute("aria-busy");
  main.innerHTML = `
    <section class="local-open-notice">
      <p class="eyebrow">상당 현장 ON</p>
      <h1>웹사이트 주소로 열어 주세요</h1>
      <ul class="help-list">
        <li>현재 상태: 내 PC의 HTML 파일을 직접 열어, 브라우저 제한으로 게시물 불러오기 불가</li>
        <li>바로 확인하려면: 아래 ‘제작 확인용 사이트 열기’ 선택</li>
        <li>직접 운영하려면: README 순서대로 GitHub Pages 설정 후 발급된 주소로 접속</li>
      </ul>
      <a class="btn" href="https://sangdang-field-on.goldburg18.chatgpt.site">제작 확인용 사이트 열기</a>
      <ul class="editor-help help-list">
        <li>확인용 사이트: 제작한 예시 자료 확인용</li>
        <li>PC에서 수정한 내용: 확인용 사이트에 자동 반영되지 않음</li>
      </ul>
      <details>
        <summary>내 PC의 수정내용을 확인하려면 (Python 설치 필요)</summary>
        <ol>
          <li>압축을 푼 뒤 index.html이 있는 폴더에서 터미널 열기</li>
          <li><code>python -m http.server 8000 --bind 127.0.0.1</code> 실행</li>
          <li>브라우저에서 <a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/</a> 접속</li>
          <li>확인을 마치면 터미널에서 Ctrl+C로 종료</li>
        </ol>
        <p class="editor-help">· GitHub Pages로 접속할 때는 Python 설치 불필요</p>
      </details>
    </section>`;
})();
