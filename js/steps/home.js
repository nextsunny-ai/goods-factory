/* ============ 홈 — 원스톱 vs 개별 도구 진입 ============ */
var GF_HOME = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  var TOOLS = [
    { id: 'mockup', step: 5, ico: '🎨', name: '굿즈 목업', desc: '디자인을 제품에 얹어 미리보기' },
    { id: 'prompt', step: 4, ico: '🖼️', name: '이미지 프롬프트 · 생성', desc: '굿즈 골라 시안 프롬프트·이미지 생성' },
    { id: 'detail', step: 7, ico: '🛍️', name: '상세페이지', desc: '쇼핑몰 상세페이지 만들기' },
    { id: 'proposal', step: 7, ico: '📈', name: '제안서 · 견적', desc: '제안서·견적서·발주서 문서 만들기' }
  ];

  function render(root) {
    var p = GF_STORE.state.project;
    var html = ''
      + '<div class="home-hero">'
      + '  <h1>무엇을 하시겠어요?</h1>'
      + '  <p>처음부터 끝까지 <b>원스톱</b>으로 하거나, 필요한 <b>도구 하나만</b> 바로 쓸 수 있습니다.</p>'
      + '</div>'

      + '<div class="home-grid">'
      + '  <div class="home-card home-onestop" id="homeOnestop">'
      + '    <div class="hc-badge">원스톱</div>'
      + '    <div class="hc-ico">🏭</div>'
      + '    <h2>처음부터 끝까지</h2>'
      + '    <p>기획 → 시장 → 굿즈 → 디자인 → 목업 → 스케줄 → 산출물<br>7단계로 굿즈 기획부터 발주 문서까지 죽.</p>'
      + '    <button class="btn btn-primary btn-block" id="btnStartOnestop">원스톱 시작</button>'
      + '  </div>'
      + '  <div class="home-tools">'
      + '    <div class="hc-badge alt">개별 도구</div>'
      + '    <div class="tool-grid">'
      + TOOLS.map(function (t) {
          return '<button class="tool-card" data-tool="' + t.id + '" data-step="' + t.step + '">'
            + '<span class="tc-ico">' + t.ico + '</span>'
            + '<span class="tc-name">' + esc(t.name) + '</span>'
            + '<span class="tc-desc">' + esc(t.desc) + '</span></button>';
        }).join('')
      + '    </div>'
      + '  </div>'
      + '</div>'

      + '<div class="home-current" id="homeCurProj" style="cursor:pointer" title="눌러서 프로젝트 바꾸기">'
      + '  <div><span style="font-size:12px;color:var(--ink-3)">지금 프로젝트 <span style="color:var(--accent-deep)">▾ 바꾸기</span></span><br><b>' + esc(p.name || '새 프로젝트') + '</b>'
      + (p.plan.ipName ? ' · ' + esc(p.plan.ipName) : '') + (p.goods.length ? ' · 굿즈 ' + p.goods.length + '종' : '') + '</div>'
      + '  <div style="display:flex;align-items:center;gap:10px">'
      + '    <span style="font-size:11.5px;color:var(--ink-4)">' + (typeof GF_VERSION !== 'undefined' ? 'v' + GF_VERSION : '') + '</span>'
      + '    <button class="btn btn-ghost btn-sm" id="homeProjects">내 프로젝트 목록</button>'
      + '  </div>'
      + '</div>';

    root.innerHTML = html;

    $('#btnStartOnestop').addEventListener('click', openStartModal);
    GF_UI.$all('[data-tool]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-tool');
        GF_APP.go(Number(b.getAttribute('data-step')));
        if (id === 'prompt' && !GF_STORE.state.project.goods.length) GF_UI.toast('먼저 3단계 "굿즈"에서 품목을 고르면 프롬프트가 나옵니다');
        if (id === 'proposal') GF_UI.toast('아래 "제안서·문서 디자인 양식"에서 양식을 고르고 미리보기하세요');
      });
    });
    var cur = $('#homeCurProj');
    if (cur) cur.addEventListener('click', function (e) {
      if (e.target.closest('#homeProjects')) return;   /* 목록 버튼은 자체 처리 */
      openProjects();
    });
    $('#homeProjects').addEventListener('click', function (e) { e.stopPropagation(); openProjects(); });
  }

  function openProjects() { if (GF_APP.openProjectManager) GF_APP.openProjectManager(); }

  /* 원스톱 시작 = ①프로젝트 선택 → ②자동/수동 */
  function openStartModal() { renderStartModal(); }

  function renderStartModal() {
    var list = GF_STORE.listProjects();
    var active = GF_STORE.activeId();
    var projRows = list.map(function (p) {
      var on = p.id === active;
      return '<button class="mode-card" data-switch="' + p.id + '" style="padding:12px 14px;' + (on ? 'border-color:var(--accent);background:var(--accent-soft)' : '') + '">'
        + '<b style="font-size:13.5px">' + esc(p.name || '이름 없음') + (on ? ' <span class="proj-cur">현재</span>' : '') + '</b>'
        + '<span style="font-size:11.5px;color:var(--ink-3)">' + (on ? '이 프로젝트로 진행' : '눌러서 이걸로 바꾸기') + '</span></button>';
    }).join('');

    GF_UI.openModal('원스톱 시작',
      '<div style="font-size:12.5px;font-weight:800;color:var(--ink-2);margin-bottom:8px">1. 어느 프로젝트로 할까요?</div>'
      + '<div class="mode-grid" style="grid-template-columns:1fr 1fr">' + projRows
      + '<button class="mode-card" data-newproj="1" style="padding:12px 14px;border-style:dashed"><b style="font-size:13.5px">＋ 새 프로젝트</b><span style="font-size:11.5px;color:var(--ink-3)">빈 프로젝트로 시작</span></button></div>'
      + '<div id="newProjArea"></div>'
      + '<hr class="divider">'
      + '<div style="font-size:12.5px;font-weight:800;color:var(--ink-2);margin-bottom:8px">2. 어떻게 진행할까요?</div>'
      + '<div class="mode-grid">'
      + '<button class="mode-card" data-mode="manual"><span class="mc-ico">✍️</span><b>수동 — 내가 직접</b>'
      + '<span>단계별로 직접 입력. 프로그램이 트렌드·포화도·카탈로그·계산기·프롬프트를 제공합니다. (AI 없이 전부 가능)</span></button>'
      + '<button class="mode-card" data-mode="ai"><span class="mc-ico">✨</span><b>자동 — AI에게 맡기기</b>'
      + '<span>IP·아이디어만 적으면 AI가 기획·추천 굿즈·컨셉·프롬프트 초안. <em>(제미나이 연결 시 앱에서 바로 생성)</em></span></button>'
      + '</div>');

    /* 프로젝트 전환 */
    GF_UI.$all('[data-switch]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-switch');
        if (id !== GF_STORE.activeId()) { GF_STORE.openProject(id); $('#projectName').value = GF_STORE.state.project.name; GF_AI.refreshPill(); }
        renderStartModal();  /* 선택 반영 위해 다시 그림 */
      });
    });
    /* 새 프로젝트 — 인라인 이름 입력 */
    var np = $('[data-newproj]');
    if (np) np.addEventListener('click', function () {
      var area = $('#newProjArea');
      area.innerHTML = '<div class="field" style="margin-top:10px"><label>새 프로젝트 이름</label>'
        + '<div style="display:flex;gap:8px"><input type="text" id="npName" placeholder="예: 버블보블 40주년 팝업 굿즈" style="flex:1">'
        + '<button class="btn btn-primary btn-sm" id="npCreate">만들기</button></div></div>';
      var inp = $('#npName'); inp.focus();
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#npCreate').click(); });
      $('#npCreate').addEventListener('click', function () {
        GF_STORE.newProject(inp.value.trim() || '새 굿즈 프로젝트');
        $('#projectName').value = GF_STORE.state.project.name; GF_AI.refreshPill();
        renderStartModal();
        GF_UI.toast('새 프로젝트를 만들었습니다 — 방식을 고르세요');
      });
    });
    /* 방식 선택 → 시작 */
    GF_UI.$all('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-mode');
        GF_STORE.state.project.plan.planMode = mode; GF_STORE.save();
        GF_UI.closeModal(); GF_APP.go(1);
        if (mode === 'ai' && !GF_AI.geminiOn()) GF_UI.toast('자동 모드 — 제미나이를 연결하면 앱에서 바로 생성됩니다 (우측 상단 AI 연결)');
        else GF_UI.toast('"' + GF_STORE.state.project.name + '" · ' + (mode === 'ai' ? '자동' : '수동') + ' 모드로 시작합니다');
      });
    });
  }

  return { render: render };
})();
