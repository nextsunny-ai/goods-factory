/* ============ 공통 UI 유틸 ============ */
var GF_UI = (function () {

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* HTML 이스케이프 (사용자 입력 → 화면/산출물 출력 시 필수) */
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* 토스트 */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add('hidden'); }, 2200);
  }

  /* 모달 */
  function openModal(title, bodyHtml) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHtml;
    $('#modalOverlay').classList.remove('hidden');
  }
  function closeModal() { $('#modalOverlay').classList.add('hidden'); }

  /* 클립보드 복사 */
  function copyText(text, doneMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast(doneMsg || '복사했습니다'); }
      catch (e) { toast('복사 실패 — 직접 선택해서 복사해주세요'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(doneMsg || '복사했습니다'); }, fallback);
    } else { fallback(); }
  }

  /* 파일 다운로드 */
  function download(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }

  /* 새 창에 HTML 열기 (인쇄/미리보기용) */
  function openHtml(html) {
    var w = window.open('', '_blank');
    if (!w) { toast('팝업이 차단되었습니다. 팝업 허용 후 다시 눌러주세요'); return null; }
    w.document.open(); w.document.write(html); w.document.close();
    return w;
  }

  /* 금액 표기 */
  function won(n) {
    if (n === null || n === undefined || isNaN(n)) return '-';
    return Math.round(n).toLocaleString('ko-KR') + '원';
  }
  function wonRange(arr) { return arr[0].toLocaleString('ko-KR') + '~' + arr[1].toLocaleString('ko-KR') + '원'; }

  /* 이미지 파일 → 리사이즈된 dataURL (localStorage 용량 보호) */
  function readImage(file, maxW, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, (maxW || 1100) / img.width);
        var cv = document.createElement('canvas');
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { toast('이미지를 읽을 수 없습니다'); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* 프롬프트 박스 렌더링 (공통) */
  function promptListHtml(prompts, keyPrefix) {
    var h = '<div class="prompt-list">';
    prompts.forEach(function (p, i) {
      h += '<div class="prompt-box">'
        + '<div class="prompt-head"><div><div class="prompt-title">' + esc(p.title) + '</div>'
        + '<div class="prompt-use">붙여넣을 곳: ' + esc(p.use || '챗GPT·제미나이·클로드') + '</div></div>'
        + '<button class="btn btn-soft btn-sm" data-copyprompt="' + keyPrefix + i + '">복사</button></div>'
        + '<pre id="pre-' + keyPrefix + i + '">' + esc(p.text) + '</pre>'
        + '</div>';
    });
    h += '</div>';
    return h;
  }
  function bindPromptCopy(root) {
    $all('[data-copyprompt]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pre = $('#pre-' + btn.getAttribute('data-copyprompt'));
        copyText(pre.textContent, '프롬프트를 복사했습니다 — AI 채팅창에 붙여넣으세요');
      });
    });
  }

  /* 오늘 날짜 문자열 */
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  return { $:$, $all:$all, esc:esc, toast:toast, openModal:openModal, closeModal:closeModal,
    copyText:copyText, download:download, openHtml:openHtml, won:won, wonRange:wonRange,
    readImage:readImage, promptListHtml:promptListHtml, bindPromptCopy:bindPromptCopy, today:today };
})();
