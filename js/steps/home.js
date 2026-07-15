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

      + '<div class="home-current">'
      + '  <div><span style="font-size:12px;color:var(--ink-3)">지금 프로젝트</span><br><b>' + esc(p.name || '새 프로젝트') + '</b>'
      + (p.plan.ipName ? ' · ' + esc(p.plan.ipName) : '') + (p.goods.length ? ' · 굿즈 ' + p.goods.length + '종' : '') + '</div>'
      + '  <div style="display:flex;align-items:center;gap:10px">'
      + '    <span style="font-size:11.5px;color:var(--ink-4)">' + (typeof GF_VERSION !== 'undefined' ? 'v' + GF_VERSION : '') + '</span>'
      + '    <button class="btn btn-ghost btn-sm" id="homeProjects">내 프로젝트 목록</button>'
      + '  </div>'
      + '</div>';

    root.innerHTML = html;

    $('#btnStartOnestop').addEventListener('click', openModeModal);
    GF_UI.$all('[data-tool]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-tool');
        var step = Number(b.getAttribute('data-step'));
        /* 개별 도구는 필요한 최소 조건만 안내하고 해당 단계로 */
        GF_APP.go(step);
        if (id === 'prompt' && !GF_STORE.state.project.goods.length) GF_UI.toast('먼저 3단계 "굿즈"에서 품목을 고르면 프롬프트가 나옵니다');
        if (id === 'proposal') GF_UI.toast('아래 "제출 문서 디자인 양식"에서 양식을 고르고 미리보기하세요');
      });
    });
    $('#homeProjects').addEventListener('click', function () { GF_APP.openProjectManager && GF_APP.openProjectManager(); });
  }

  function openModeModal() {
    GF_UI.openModal('원스톱 시작 — 방식 선택',
      '<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:16px">어떻게 진행할까요? 언제든 1단계에서 바꿀 수 있습니다.</p>'
      + '<div class="mode-grid">'
      + '<button class="mode-card" data-mode="manual"><span class="mc-ico">✍️</span><b>수동 — 내가 직접</b>'
      + '<span>단계별로 직접 입력. 프로그램이 트렌드·포화도·카탈로그·계산기·프롬프트를 제공합니다. (AI 없이 전부 가능)</span></button>'
      + '<button class="mode-card" data-mode="ai"><span class="mc-ico">✨</span><b>자동 — AI에게 맡기기</b>'
      + '<span>AI가 트렌드·기존 굿즈를 분석해 경쟁력 있는 굿즈·스타일·프롬프트까지 초안. 나는 확인·수정. <em>(AI 연결 필요, 없으면 안내)</em></span></button>'
      + '</div>');
    GF_UI.$all('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-mode');
        GF_STORE.state.project.plan.planMode = mode;
        GF_STORE.save();
        GF_UI.closeModal();
        GF_APP.go(1);
        if (mode === 'ai' && !GF_AI.anyOn()) GF_UI.toast('자동 모드 — AI를 연결하면 기획·프롬프트가 자동 완성됩니다 (우측 상단 AI 연결)');
        else GF_UI.toast(mode === 'ai' ? '자동 모드로 시작합니다' : '수동 모드로 시작합니다');
      });
    });
  }

  return { render: render, openModeModal: openModeModal };
})();
