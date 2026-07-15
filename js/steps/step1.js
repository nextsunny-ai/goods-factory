/* ============ 1단계: 기획 입력 ============ */
var GF_STEP1 = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  var IP_TYPES = ['캐릭터', '웹툰·만화', '게임', '아이돌·아티스트', '영화·드라마', '브랜드·기업', '자체 창작', '기타'];
  var PURPOSES = ['온라인 판매', '팝업스토어·행사', '펀딩(텀블벅·와디즈)', '기업 판촉·증정', 'B2B 입점·납품'];

  function promptCtx() {
    var p = GF_STORE.state.project.plan;
    return {
      ipName: p.ipName, ipDesc: p.ipDesc,
      targetName: GF_STORE.targetName() + (p.ageGroup ? ' (' + p.ageGroup + ')' : ''),
      budgetText: p.budget ? GF_UI.won(p.budget) : ''
    };
  }

  function render(root) {
    var p = GF_STORE.state.project.plan;

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 1</span>'
      + '  <h1>기획 입력</h1>'
      + '  <p>무슨 IP로, 누구에게, 얼마의 예산으로 만들지 정합니다. 여기 입력한 내용이 이후 모든 단계의 기준이 됩니다.</p>'
      + '</div>'

      + '<div class="card"><h3>기획 방식</h3>'
      + '<p class="desc">직접 다 채워도 되고, 큰 방향은 AI에게 맡기고 결과를 참고해도 됩니다. (IP 이름만 있으면 AI 모드를 쓸 수 있습니다)</p>'
      + '<div class="chip-group" id="f-planMode">'
      + '<button class="chip' + (p.planMode !== 'ai' ? ' on' : '') + '" data-v="manual">내가 직접 작성</button>'
      + '<button class="chip' + (p.planMode === 'ai' ? ' on' : '') + '" data-v="ai">AI에게 기획 맡기기</button>'
      + '</div>'
      + '<div id="aiPlanBox" style="margin-top:14px"></div>'
      + '</div>'

      + '<div class="card" id="card-ipinfo"><h3>IP(지식재산) 정보</h3>'
      + '<div class="form-grid">'
      + '  <div class="field"><label>IP 이름 <small>작품·캐릭터·브랜드 이름</small></label>'
      + '    <input type="text" id="f-ipName" placeholder="예: 버블보블, 화산귀환, 우리 회사 마스코트" value="' + esc(p.ipName) + '"></div>'
      + '  <div class="field"><label>IP 종류</label><select id="f-ipType">'
      + IP_TYPES.map(function (t) { return '<option' + (p.ipType === t ? ' selected' : '') + '>' + t + '</option>'; }).join('')
      + '  </select></div>'
      + '  <div class="field full"><label>IP 한 줄 소개 <small>AI 프롬프트에 그대로 들어갑니다 — 구체적일수록 좋음</small></label>'
      + '    <textarea id="f-ipDesc" placeholder="예: 1986년 출시된 레트로 아케이드 게임. 초록 공룡 캐릭터가 버블을 쏘는 픽셀 그래픽이 특징">' + esc(p.ipDesc) + '</textarea></div>'
      + '</div></div>'

      + '<div class="card"><h3>타깃과 예산</h3>'
      + '<div class="form-grid">'
      + '  <div class="field"><label>주요 타깃</label><select id="f-target">'
      + '    <option value="fandom"' + (p.target === 'fandom' ? ' selected' : '') + '>팬덤 (이 IP를 아는 팬)</option>'
      + '    <option value="general"' + (p.target === 'general' ? ' selected' : '') + '>일반 소비자 (디자인으로 구매)</option>'
      + '    <option value="kids"' + (p.target === 'kids' ? ' selected' : '') + '>키즈·패밀리</option>'
      + '  </select></div>'
      + '  <div class="field"><label>연령대</label>'
      + '    <input type="text" id="f-ageGroup" placeholder="예: 20~30대" value="' + esc(p.ageGroup) + '"></div>'
      + '  <div class="field"><label>제작 예산 <small>원 — 굿즈 제작비 기준</small></label>'
      + '    <input type="number" id="f-budget" step="100000" min="0" value="' + (p.budget || '') + '"></div>'
      + '  <div class="field"><label>목표 일정 <small>행사일·출시 희망일</small></label>'
      + '    <input type="text" id="f-deadline" placeholder="예: 2026-09-15 팝업 오픈" value="' + esc(p.deadline) + '"></div>'
      + '  <div class="field full"><label>제작 목적</label><div class="chip-group" id="f-purpose">'
      + PURPOSES.map(function (t) { return '<button class="chip' + (p.purpose === t ? ' on' : '') + '" data-v="' + t + '">' + t + '</button>'; }).join('')
      + '  </div></div>'
      + '  <div class="field full"><label>판매 채널 <small>복수 선택 — 수수료가 마진 계산에 반영됩니다</small></label><div class="chip-group" id="f-channels">'
      + GF_CHANNELS.map(function (ch) {
          var on = p.channels.indexOf(ch.id) >= 0;
          return '<button class="chip' + (on ? ' on' : '') + '" data-v="' + ch.id + '">' + ch.name + ' <small>' + ch.fee[0] + '~' + ch.fee[1] + '%</small></button>';
        }).join('')
      + '  </div></div>'
      + '</div></div>'

      + '<div class="card" id="card-prompts"><h3>이 단계의 AI 프롬프트</h3>'
      + '<p class="desc">복사해서 쓰시는 챗GPT·제미나이·클로드 채팅창에 붙여넣으면, 입력한 내용 기준으로 기획을 넓혀줍니다.</p>'
      + GF_AI.enhanceBtn('aiEnhStep1', 'AI로 기획 자동 완성', 'text', '입력한 IP만으로 매력·타깃·추천 굿즈·컨셉까지 기획을 자동으로 채워줍니다.')
      + '<div id="p1-prompts" style="margin-top:14px"></div>'
      + '</div>'

      + GF_EXPORT_STEPDOC.barHtml(1)

      + '<div class="step-footer">'
      + '  <span class="hint">입력 내용은 자동 저장됩니다</span>'
      + '  <button class="btn btn-primary" id="btnNext1">다음 → 시장 분석</button>'
      + '</div>';

    root.innerHTML = html;
    GF_EXPORT_STEPDOC.bindBar(1);
    renderPrompts();
    renderAiPlan();
    GF_AI.bindEnhance(root);
    var enh = GF_UI.$('#aiEnhStep1');
    if (enh) enh.addEventListener('click', function () { GF_UI.toast('연결됨 — 자동 생성은 준비 중입니다. 지금은 아래 프롬프트를 복사해 쓰세요'); });

    /* AI 모드면 중복되는 카드(수동 상세폼) 숨김 — AI 박스에 기본 입력이 있음 */
    applyModeVisibility();

    GF_UI.$all('#f-planMode .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        p.planMode = chip.getAttribute('data-v');
        GF_STORE.save();
        render(root);   /* 모드 바뀌면 화면 전체 다시 그림 (깔끔하게 show/hide) */
      });
    });

    /* 입력 바인딩 */
    bind('f-ipName', 'ipName'); bind('f-ipDesc', 'ipDesc');
    bind('f-ageGroup', 'ageGroup'); bind('f-deadline', 'deadline');
    $('#f-ipType').addEventListener('change', function () { p.ipType = this.value; GF_STORE.save(); });
    $('#f-target').addEventListener('change', function () { p.target = this.value; GF_STORE.save(); renderPrompts(); });
    $('#f-budget').addEventListener('input', function () { p.budget = Number(this.value) || 0; GF_STORE.save(); renderPrompts(); });

    GF_UI.$all('#f-purpose .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        p.purpose = chip.getAttribute('data-v');
        GF_UI.$all('#f-purpose .chip').forEach(function (c) { c.classList.toggle('on', c === chip); });
        GF_STORE.save();
      });
    });
    GF_UI.$all('#f-channels .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var v = chip.getAttribute('data-v');
        var idx = p.channels.indexOf(v);
        if (idx >= 0) p.channels.splice(idx, 1); else p.channels.push(v);
        chip.classList.toggle('on');
        GF_STORE.save();
      });
    });

    $('#btnNext1').addEventListener('click', function () {
      if (!p.ipName.trim()) { GF_UI.toast('IP 이름을 입력해주세요'); $('#f-ipName').focus(); return; }
      GF_APP.go(2);
    });

    function bind(id, key) {
      $('#' + id).addEventListener('input', function () { p[key] = this.value; GF_STORE.save(); });
      $('#' + id).addEventListener('blur', renderPrompts);
    }
  }

  function renderPrompts() {
    var box = GF_UI.$('#p1-prompts');
    if (!box) return;
    box.innerHTML = GF_UI.promptListHtml(GF_PROMPTS.step1(promptCtx()), 's1-');
    GF_UI.bindPromptCopy(box);
  }

  /* AI 모드일 때 수동용 상세 카드 숨김 (AI 박스에 기본 입력이 있음) */
  function applyModeVisibility() {
    var ai = GF_STORE.state.project.plan.planMode === 'ai';
    var ipCard = GF_UI.$('#card-ipinfo');
    var pCard = GF_UI.$('#card-prompts');
    if (ipCard) ipCard.classList.toggle('hidden', ai);
    if (pCard) pCard.classList.toggle('hidden', ai);
  }

  function renderAiPlan() {
    var box = GF_UI.$('#aiPlanBox');
    if (!box) return;
    var p = GF_STORE.state.project.plan;
    if (p.planMode !== 'ai') { box.innerHTML = ''; return; }
    box.innerHTML = ''
      + '<div class="note"><b>AI에게 맡겨도 "무엇을" 만들지는 알려줘야 합니다.</b> 아래 두 칸만 채우면, 그 내용으로 AI 기획 프롬프트가 완성됩니다.</div>'
      + '<div class="field" style="margin-top:12px"><label>무슨 IP·브랜드로 만드나요? <small>필수</small></label>'
      + '<input type="text" id="ai-ipName" placeholder="예: 버블보블 / 우리 회사 마스코트 / 조선요괴전" value="' + esc(p.ipName) + '"></div>'
      + '<div class="field" style="margin-top:10px"><label>어떤 걸 만들고 싶은지 (한두 줄) <small>있으면 더 정확</small></label>'
      + '<textarea id="ai-ipDesc" placeholder="예: 30~40대 레트로 게임 팬 대상 뮤지엄 기념 굿즈. 소장가치 있고 아기자기하게.">' + esc(p.ipDesc) + '</textarea></div>'
      + '<div style="margin-top:12px">' + GF_AI.enhanceBtn('aiEnhAuto', 'AI로 기획 자동 완성', 'text', '적은 IP·아이디어만으로 매력·타깃·추천 굿즈·컨셉·전략까지 기획을 완성합니다.') + '</div>'
      + '<div id="ai-result" style="margin-top:12px"></div>'
      + '<div style="margin-top:14px"><div style="font-size:12.5px;font-weight:700;color:var(--ink-2);margin-bottom:6px">AI에 직접 붙여넣을 프롬프트 (연결 안 했을 때)</div><div id="ai-promptbox"></div></div>';

    function refresh() {
      var pb = GF_UI.$('#ai-promptbox');
      if (pb) { pb.innerHTML = GF_UI.promptListHtml(GF_PROMPTS.step1ai(promptCtx()), 's1ai-'); GF_UI.bindPromptCopy(pb); }
    }
    var nameInp = GF_UI.$('#ai-ipName'), descInp = GF_UI.$('#ai-ipDesc');
    nameInp.addEventListener('input', function () { p.ipName = this.value; GF_STORE.save(); refresh(); });
    descInp.addEventListener('input', function () { p.ipDesc = this.value; GF_STORE.save(); refresh(); });
    GF_AI.bindEnhance(box);
    var enh = GF_UI.$('#aiEnhAuto');
    if (enh) enh.addEventListener('click', runAutoPlan);
    refresh();
    nameInp.focus();
  }

  /* 제미나이로 실제 기획 자동 생성 */
  function runAutoPlan() {
    var p = GF_STORE.state.project.plan;
    if (!p.ipName.trim()) { GF_UI.toast('먼저 "무슨 IP·브랜드로 만드나요?"를 써주세요'); var n = GF_UI.$('#ai-ipName'); if (n) n.focus(); return; }
    if (!GF_AI.geminiOn()) { GF_AI.openPanel(); return; }
    var out = GF_UI.$('#ai-result');
    out.innerHTML = '<div class="note">AI가 기획을 작성 중입니다…</div>';
    var prompt = GF_PROMPTS.step1ai(promptCtx())[0].text;
    GF_AI.generateText(prompt).then(function (text) {
      out.innerHTML = '<div class="card" style="box-shadow:none;border-color:var(--accent-line)">'
        + '<div class="card-head" style="margin-bottom:8px"><h3 style="margin:0">✨ AI 기획 초안</h3>'
        + '<button class="btn btn-xs btn-soft" id="aiPlanCopy">복사</button></div>'
        + '<div id="aiPlanText" style="font-size:13px;white-space:pre-wrap;line-height:1.7;color:var(--ink)">' + esc(text) + '</div></div>';
      var cp = GF_UI.$('#aiPlanCopy');
      if (cp) cp.addEventListener('click', function () { GF_UI.copyText(text, '기획 초안을 복사했습니다'); });
      GF_UI.toast('AI 기획 초안이 나왔습니다 — 아래 항목·다음 단계에 참고하세요');
    }).catch(function (err) {
      out.innerHTML = '<div class="note warn"><b>생성 실패 — ' + esc(String((err && err.message) || err)) + '</b><br>제미나이 키·권한을 확인하세요. (글 생성은 보통 무료 한도로 됩니다)</div>';
    });
  }

  return { render: render, promptCtx: promptCtx };
})();
