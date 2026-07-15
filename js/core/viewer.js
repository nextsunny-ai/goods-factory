/* ============ 문서 뷰어 — 앱 안에서 보기 + 직접 수정 + 저장/인쇄/다운로드 ============
   docKey별 수정본은 project.docEdits[docKey]에 저장.
   수정본이 있으면 수정본을 열고, "원본 다시 생성"으로 데이터 기준 재생성 가능. */
var GF_VIEWER = (function () {
  var $ = GF_UI.$;
  var cur = null;   /* { docKey, title, buildFn, fileName, editing } */

  function ensureDom() {
    if ($('#docViewer')) return;
    var el = document.createElement('div');
    el.id = 'docViewer';
    el.className = 'doc-viewer hidden';
    el.innerHTML = ''
      + '<div class="dv-bar">'
      + '  <div class="dv-title" id="dvTitle"></div>'
      + '  <div class="dv-actions">'
      + '    <span class="dv-note" id="dvNote"></span>'
      + '    <button class="btn btn-sm btn-soft" id="dvEdit">✏ 수정 모드</button>'
      + '    <button class="btn btn-sm btn-primary hidden" id="dvSaveEdit">수정본 저장</button>'
      + '    <button class="btn btn-sm btn-ghost" id="dvRegen">원본 다시 생성</button>'
      + '    <button class="btn btn-sm btn-ghost" id="dvPrint">인쇄 / PDF</button>'
      + '    <button class="btn btn-sm btn-dark" id="dvDown">HTML 저장</button>'
      + '    <button class="btn btn-sm btn-ghost" id="dvClose">닫기 ✕</button>'
      + '  </div>'
      + '</div>'
      + '<iframe id="dvFrame"></iframe>';
    document.body.appendChild(el);

    $('#dvClose').addEventListener('click', close);
    $('#dvEdit').addEventListener('click', toggleEdit);
    $('#dvSaveEdit').addEventListener('click', saveEdit);
    $('#dvRegen').addEventListener('click', regen);
    $('#dvPrint').addEventListener('click', function () {
      var f = $('#dvFrame');
      try { f.contentWindow.focus(); f.contentWindow.print(); }
      catch (e) { GF_UI.toast('인쇄 창을 열 수 없습니다 — HTML 저장 후 브라우저에서 인쇄해주세요'); }
    });
    $('#dvDown').addEventListener('click', function () {
      if (!cur) return;
      GF_UI.download(cur.fileName, currentHtml(), 'text/html;charset=utf-8');
      GF_UI.toast('문서를 저장했습니다');
    });
  }

  function currentHtml() {
    var doc = $('#dvFrame').contentDocument;
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  function open(opts) {   /* {docKey, title, buildFn, fileName} */
    ensureDom();
    cur = opts; cur.editing = false;
    var edits = GF_STORE.state.project.docEdits || {};
    var html = edits[opts.docKey] || opts.buildFn();
    $('#dvTitle').textContent = opts.title;
    $('#dvNote').textContent = edits[opts.docKey] ? '수정본을 보는 중 — 입력 데이터를 바꿨다면 "원본 다시 생성"' : '';
    $('#dvFrame').srcdoc = html;
    setEditUi(false);
    $('#docViewer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (cur && cur.editing) { saveEdit(); }   /* 수정 중 닫기 = 자동 저장 (작업 유실 방지) */
    $('#docViewer').classList.add('hidden');
    document.body.style.overflow = '';
    cur = null;
  }

  function setEditUi(on) {
    if (cur) cur.editing = on;
    $('#dvEdit').classList.toggle('btn-soft', !on);
    $('#dvEdit').textContent = on ? '수정 모드 켜짐 (문서를 클릭해 바로 고치세요)' : '✏ 수정 모드';
    $('#dvSaveEdit').classList.toggle('hidden', !on);
    var doc = $('#dvFrame').contentDocument;
    if (doc) {
      try { doc.designMode = on ? 'on' : 'off'; } catch (e) {}
    }
  }

  function toggleEdit() {
    if (!cur) return;
    setEditUi(!cur.editing);
    if (cur.editing) GF_UI.toast('문서의 글자를 클릭해서 바로 고칠 수 있습니다. 끝나면 "수정본 저장"');
  }

  function saveEdit() {
    if (!cur) return;
    var doc = $('#dvFrame').contentDocument;
    try { doc.designMode = 'off'; } catch (e) {}
    GF_STORE.state.project.docEdits[cur.docKey] = currentHtml();
    GF_STORE.save();
    setEditUi(false);
    $('#dvNote').textContent = '수정본을 보는 중 — 입력 데이터를 바꿨다면 "원본 다시 생성"';
    GF_UI.toast('수정본을 저장했습니다 — 다운로드·인쇄에 그대로 반영됩니다');
  }

  function regen() {
    if (!cur) return;
    if (GF_STORE.state.project.docEdits[cur.docKey]) {
      /* 옛 수정본 보존: 삭제 대신 백업 키로 이동 */
      GF_STORE.state.project.docEdits[cur.docKey + '_이전수정본'] = GF_STORE.state.project.docEdits[cur.docKey];
      delete GF_STORE.state.project.docEdits[cur.docKey];
      GF_STORE.save();
    }
    $('#dvFrame').srcdoc = cur.buildFn();
    $('#dvNote').textContent = '';
    setEditUi(false);
    GF_UI.toast('입력 데이터 기준으로 다시 생성했습니다 (이전 수정본은 보관됨)');
  }

  return { open: open, close: close };
})();
