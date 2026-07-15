/* ============ 앱 진입점: 라우팅 + 앱바 + 복구 배너 ============ */
var GF_APP = (function () {
  var $ = GF_UI.$;
  var current = 1;
  var STEPS = {
    1: GF_STEP1, 2: GF_STEP2, 3: GF_STEP3, 4: GF_STEP4,
    5: GF_MOCKUP, 6: GF_SCHEDULE, 7: GF_STEP5, settings: GF_SETTINGS
  };

  function go(step) {
    current = step;
    var mod = STEPS[step];
    if (!mod) return;
    if (typeof step === 'number') { GF_STORE.state.project.updatedStep = step; GF_STORE.save(); }
    GF_UI.$all('.nav-tab').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-step') === String(step));
    });
    markDone();
    mod.render($('#content'));
    window.scrollTo(0, 0);
  }

  function markDone() {
    var p = GF_STORE.state.project;
    var done = {
      1: !!p.plan.ipName,
      2: p.market.checked.length > 0 || !!p.market.memo,
      3: p.goods.length > 0,
      4: !!(p.design.concept || p.design.palette || p.design.mood || p.design.keywords),
      5: !!(p.mockups && p.mockups.current),
      6: p.goods.length > 0,
      7: !!(p.detail.title || p.detail.heroImg || (p.docEdits && Object.keys(p.docEdits).length))
    };
    GF_UI.$all('.nav-tab').forEach(function (el) {
      var s = Number(el.getAttribute('data-step'));
      el.classList.toggle('done', !!done[s] && current !== s);
    });
  }

  function bindAppbar() {
    var nameInput = $('#projectName');
    nameInput.value = GF_STORE.state.project.name;
    nameInput.addEventListener('input', function () { GF_STORE.state.project.name = this.value; GF_STORE.save(); });

    $('#brandHome').addEventListener('click', function () { go(GF_STORE.state.project.updatedStep || 1); });
    $('#btnAiPanel').addEventListener('click', GF_AI.openPanel);
    $('#btnSettings').addEventListener('click', function () { go('settings'); });

    /* 프로젝트 메뉴 드롭다운 */
    var menu = $('#projMenu');
    $('#btnProjMenu').addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('hidden'); });
    document.addEventListener('click', function () { menu.classList.add('hidden'); });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
    GF_UI.$all('[data-menu]', menu).forEach(function (b) {
      b.addEventListener('click', function () {
        menu.classList.add('hidden');
        var a = b.getAttribute('data-menu');
        if (a === 'export') GF_STORE.exportJson();
        else if (a === 'import') $('#importJsonFile').click();
        else if (a === 'new') newProject();
        else if (a === 'projects') openProjectManager();
      });
    });

    $('#importJsonFile').addEventListener('change', function () {
      if (!this.files[0]) return;
      GF_STORE.importJson(this.files[0], function (ok) {
        if (ok) { GF_UI.toast('프로젝트를 불러왔습니다'); $('#projectName').value = GF_STORE.state.project.name; GF_AI.refreshPill(); go(GF_STORE.state.project.updatedStep || 1); }
        else GF_UI.toast('파일을 읽을 수 없습니다 — GOODS FACTORY에서 저장한 .json인지 확인하세요');
      });
      this.value = '';
    });

    $('#modalClose').addEventListener('click', GF_UI.closeModal);
    $('#modalOverlay').addEventListener('click', function (e) { if (e.target === this) GF_UI.closeModal(); });

    GF_UI.$all('.nav-tab').forEach(function (el) {
      el.addEventListener('click', function () { go(Number(el.getAttribute('data-step'))); });
    });
  }

  /* 새 프로젝트 — 이름 정하고 추가 (기존 프로젝트는 그대로 보관됨) */
  function newProject() {
    GF_UI.openModal('새 프로젝트',
      '<p style="font-size:13.5px;color:var(--ink-2)">새 프로젝트를 만듭니다. <b>지금 프로젝트는 그대로 보관</b>되고, "내 프로젝트 목록"에서 언제든 다시 열 수 있습니다.</p>'
      + '<div class="field" style="margin-top:14px"><label>프로젝트 이름</label>'
      + '<input type="text" id="mNewName" placeholder="예: 버블보블 40주년 팝업 굿즈" value=""></div>'
      + '<div style="display:flex;gap:8px;margin-top:18px;justify-content:flex-end">'
      + '<button class="btn btn-ghost btn-sm" id="mCancel">취소</button>'
      + '<button class="btn btn-primary btn-sm" id="mCreate">만들기</button></div>');
    var inp = $('#mNewName'); inp.focus();
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#mCreate').click(); });
    $('#mCancel').addEventListener('click', GF_UI.closeModal);
    $('#mCreate').addEventListener('click', function () {
      var name = inp.value.trim() || '새 굿즈 프로젝트';
      GF_STORE.newProject(name);
      $('#projectName').value = GF_STORE.state.project.name;
      GF_UI.closeModal(); go(1);
      GF_UI.toast('새 프로젝트 "' + name + '"를 만들었습니다');
    });
  }

  /* 내 프로젝트 목록 — 열기·복제·이름변경·삭제(백업 후) */
  function openProjectManager() {
    var list = GF_STORE.listProjects();
    var active = GF_STORE.activeId();
    var rows = list.map(function (p) {
      var when = new Date(p.updatedAt);
      var isActive = p.id === active;
      return '<div class="proj-item' + (isActive ? ' on' : '') + '" data-pid="' + p.id + '">'
        + '<div class="proj-item-main"><div class="proj-item-name">' + GF_UI.esc(p.name || '이름 없음') + (isActive ? ' <span class="proj-cur">지금 열림</span>' : '') + '</div>'
        + '<div class="proj-item-date">' + (when.getMonth() + 1) + '/' + when.getDate() + ' ' + String(when.getHours()).padStart(2, '0') + ':' + String(when.getMinutes()).padStart(2, '0') + ' 저장</div></div>'
        + '<div class="proj-item-acts">'
        + (isActive ? '' : '<button class="btn btn-xs btn-primary" data-popen="' + p.id + '">열기</button>')
        + '<button class="btn btn-xs btn-ghost" data-pdup="' + p.id + '">복제</button>'
        + '<button class="btn btn-xs btn-ghost" data-pren="' + p.id + '">이름변경</button>'
        + '<button class="btn btn-xs btn-ghost" data-pdel="' + p.id + '">삭제</button>'
        + '</div></div>';
    }).join('');

    GF_UI.openModal('내 프로젝트 (' + list.length + '개)',
      '<p style="font-size:12.5px;color:var(--ink-3);margin-bottom:14px">이 컴퓨터·브라우저에 저장된 프로젝트입니다. 삭제 시 <b>자동으로 .json 파일로 백업</b>된 뒤 지워집니다(안전).</p>'
      + '<div class="proj-list">' + (rows || '<p style="color:var(--ink-3);font-size:13px">저장된 프로젝트가 없습니다.</p>') + '</div>'
      + '<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-soft btn-sm" id="mNewFromMgr">＋ 새 프로젝트</button></div>');

    $('#mNewFromMgr').addEventListener('click', function () { GF_UI.closeModal(); newProject(); });
    GF_UI.$all('[data-popen]').forEach(function (b) { b.addEventListener('click', function () {
      if (GF_STORE.openProject(b.getAttribute('data-popen'))) { $('#projectName').value = GF_STORE.state.project.name; GF_AI.refreshPill(); GF_UI.closeModal(); go(GF_STORE.state.project.updatedStep || 1); GF_UI.toast('프로젝트를 열었습니다'); }
    }); });
    GF_UI.$all('[data-pdup]').forEach(function (b) { b.addEventListener('click', function () {
      var nid = GF_STORE.duplicateProject(b.getAttribute('data-pdup'));
      if (nid) { GF_UI.toast('복제했습니다'); openProjectManager(); }
    }); });
    GF_UI.$all('[data-pren]').forEach(function (b) { b.addEventListener('click', function () {
      var id = b.getAttribute('data-pren');
      var cur = GF_STORE.listProjects().filter(function (x) { return x.id === id; })[0];
      renamePrompt(id, cur ? cur.name : '');
    }); });
    GF_UI.$all('[data-pdel]').forEach(function (b) { b.addEventListener('click', function () {
      var id = b.getAttribute('data-pdel');
      var cur = GF_STORE.listProjects().filter(function (x) { return x.id === id; })[0];
      confirmDelete(id, cur ? cur.name : '');
    }); });
  }

  function renamePrompt(id, curName) {
    GF_UI.openModal('이름 변경',
      '<div class="field"><label>프로젝트 이름</label><input type="text" id="mRenName" value="' + GF_UI.esc(curName) + '"></div>'
      + '<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="mRenCancel">취소</button><button class="btn btn-primary btn-sm" id="mRenOk">변경</button></div>');
    var inp = $('#mRenName'); inp.focus();
    $('#mRenCancel').addEventListener('click', openProjectManager);
    $('#mRenOk').addEventListener('click', function () {
      GF_STORE.renameProject(id, inp.value.trim() || curName);
      if (GF_STORE.state.project.id === id) $('#projectName').value = GF_STORE.state.project.name;
      openProjectManager();
    });
  }

  function confirmDelete(id, name) {
    GF_UI.openModal('프로젝트 삭제',
      '<p style="font-size:14px">"<b>' + GF_UI.esc(name) + '</b>"를 삭제할까요?</p>'
      + '<p style="font-size:12.5px;color:var(--ink-3);margin-top:6px">삭제 전 자동으로 .json 파일로 백업됩니다. 나중에 "파일에서 불러오기"로 되돌릴 수 있습니다.</p>'
      + '<div style="display:flex;gap:8px;margin-top:18px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="mDelCancel">취소</button><button class="btn btn-sm" style="background:var(--red);color:#fff" id="mDelOk">백업 후 삭제</button></div>');
    $('#mDelCancel').addEventListener('click', openProjectManager);
    $('#mDelOk').addEventListener('click', function () {
      GF_STORE.deleteProject(id);
      $('#projectName').value = GF_STORE.state.project.name;
      GF_AI.refreshPill();
      GF_UI.toast('백업 후 삭제했습니다');
      if (GF_STORE.state.project.plan.ipName || GF_STORE.state.project.goods.length) go(GF_STORE.state.project.updatedStep || 1);
      else go(1);
      openProjectManager();
    });
  }

  function init() {
    var r = GF_STORE.init();   /* 활성 프로젝트 로드 (v1.2 단일본은 자동 마이그레이션) */
    bindAppbar();
    $('#projectName').value = GF_STORE.state.project.name;
    GF_AI.refreshPill();
    var p = GF_STORE.state.project;
    go(p.updatedStep && (p.plan.ipName || p.goods.length) ? p.updatedStep : 1);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { go: go };
})();
