/* ============ AI 연결 (구독 우선) + 기능 게이팅 ============
   - 글 작업(기획·시장·카피·문구) = Claude 구독 로그인 (추천, 추가비용 없음) — v1.3 연동 예정
   - 이미지 생성 = 구독 불가 → 제미나이 API 키 (구글 결제 필요)
   - 지금은 연결 상태·게이팅 UI만. 실제 자동 생성은 v1.3.
   - 연결 안 됨 = AI 강화 버튼 비활성 + "무엇이 좋아지는지" 안내 */
var GF_AI = (function () {
  var $ = GF_UI.$;

  function state() { return GF_STORE.state.settings.ai; }
  function claudeOn() { return !!state().claudeLinked; }
  function geminiOn() { return !!(state().geminiKey && state().geminiKey.length > 10); }
  function anyOn() { return claudeOn() || geminiOn(); }

  /* 앱바 AI 알약 상태 갱신 */
  function refreshPill() {
    var pill = $('#btnAiPanel'); if (!pill) return;
    var on = anyOn();
    pill.classList.toggle('on', on);
    var txt = $('#aiPillText');
    if (on) {
      var parts = [];
      if (claudeOn()) parts.push('Claude');
      if (geminiOn()) parts.push('제미나이');
      txt.textContent = parts.join('·') + ' 연결됨';
    } else { txt.textContent = 'AI 연결'; }
  }

  /* AI 강화 버튼 HTML — kind: 'text'(글) | 'image'(이미지)
     연결 안 됨 = 비활성 + 안내. 연결됨 = 활성(실행은 v1.3 안내) */
  function enhanceBtn(id, label, kind, benefit) {
    var ok = kind === 'image' ? geminiOn() : claudeOn();
    var needLabel = kind === 'image' ? '제미나이 연결 필요' : 'Claude 구독 연결 필요';
    return '<div class="ai-enhance" data-aikind="' + kind + '">'
      + '<button class="btn btn-ai btn-sm" id="' + id + '"' + (ok ? '' : ' disabled') + '>'
      + '✨ ' + label + (ok ? '' : ' <span style="opacity:.8">· ' + needLabel + '</span>') + '</button>'
      + '<div class="ai-hint">' + (ok
          ? '<b>연결됨.</b> 이 버튼을 누르면 ' + benefit + ' <b>(자동 생성 연동은 v1.3에서 제공)</b> — 지금은 프롬프트를 복사해 쓰시면 같은 결과를 얻습니다.'
          : '기본 결과는 <b>지금도 나옵니다.</b> ' + (kind === 'image' ? '제미나이를 연결하면' : 'Claude 구독을 연결하면') + ' ' + benefit + ' <button class="btn btn-xs btn-soft" data-openai="1" style="margin-left:4px">AI 연결하기</button>')
      + '</div></div>';
  }
  function bindEnhance(root) {
    GF_UI.$all('[data-openai]', root || document).forEach(function (b) {
      b.addEventListener('click', openPanel);
    });
  }

  /* AI 연결 패널 */
  function openPanel() {
    var s = state();
    var body = ''
      + '<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:16px">AI를 연결하면 기획·카피·이미지를 자동으로 채워줍니다. <b>연결 없이도 모든 기능(프롬프트 복사 방식)은 그대로 사용</b>할 수 있습니다.</p>'

      + '<div class="card" style="box-shadow:none;margin-bottom:14px">'
      + '<div class="oc-top" style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div class="oc-ico" style="width:30px;height:30px;background:#EDE7FF;color:#6A4BD6">✍️</div>'
      + '<h3 style="font-size:15px;font-weight:800">글 작업 — Claude 구독 로그인 <span class="ai-tag">추천</span></h3></div>'
      + '<p style="font-size:12.5px;color:var(--ink-2)">기획·시장분석·상세페이지 카피·제안서 문구를 자동 작성. <b>본인 Claude 구독으로 로그인</b>하므로 추가 비용이 없습니다.</p>'
      + '<div style="margin-top:10px">' + (claudeOn()
          ? '<span class="note good" style="margin:0;display:inline-block">✓ 연결됨</span> <button class="btn btn-xs btn-ghost" id="aiClaudeOff">연결 해제</button>'
          : '<button class="btn btn-sm btn-dark" id="aiClaudeOn">Claude 구독 로그인</button> <span style="font-size:11.5px;color:var(--ink-3)">— 실제 로그인 연동은 v1.3 제공 예정</span>')
      + '</div></div>'

      + '<div class="card" style="box-shadow:none;margin-bottom:6px">'
      + '<div class="oc-top" style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div class="oc-ico" style="width:30px;height:30px">🖼️</div>'
      + '<h3 style="font-size:15px;font-weight:800">이미지 생성 — 제미나이 키</h3></div>'
      + '<p style="font-size:12.5px;color:var(--ink-2)">이미지는 구독 연결이 공식 지원되지 않아 <b>제미나이 API 키</b>가 필요합니다. 키 발급은 무료(1분), 다만 이미지 생성은 구글 클라우드 <b>결제 등록</b>이 필요합니다. 키는 이 브라우저에만 저장됩니다.</p>'
      + '<div class="field" style="margin-top:10px"><input type="text" id="aiGeminiKey" placeholder="제미나이 API 키 붙여넣기" value="' + GF_UI.esc(s.geminiKey || '') + '"></div>'
      + '<div style="margin-top:8px;font-size:11.5px;color:var(--ink-3)">키 발급: aistudio.google.com → API 키 만들기</div>'
      + '</div>'

      + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">'
      + '<button class="btn btn-ghost btn-sm" id="aiCancel">닫기</button>'
      + '<button class="btn btn-primary btn-sm" id="aiSave">저장</button></div>';

    GF_UI.openModal('AI 연결', body);

    var on = $('#aiClaudeOn'); if (on) on.addEventListener('click', function () { s.claudeLinked = true; GF_STORE.save(); GF_UI.toast('Claude 구독을 연결했습니다 (자동 생성은 v1.3)'); refreshPill(); openPanel(); });
    var off = $('#aiClaudeOff'); if (off) off.addEventListener('click', function () { s.claudeLinked = false; GF_STORE.save(); refreshPill(); openPanel(); });
    $('#aiCancel').addEventListener('click', GF_UI.closeModal);
    $('#aiSave').addEventListener('click', function () {
      s.geminiKey = $('#aiGeminiKey').value.trim();
      GF_STORE.save(); refreshPill(); GF_UI.closeModal();
      GF_UI.toast('AI 연결 설정을 저장했습니다');
    });
  }

  return { refreshPill: refreshPill, openPanel: openPanel, enhanceBtn: enhanceBtn, bindEnhance: bindEnhance,
    claudeOn: claudeOn, geminiOn: geminiOn, anyOn: anyOn };
})();
