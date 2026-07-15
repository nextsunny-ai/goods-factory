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
     글=제미나이/Claude 중 하나면 OK, 이미지=제미나이. 연결 안 됨 = 비활성 + 안내 */
  function enhanceBtn(id, label, kind, benefit) {
    var ok = kind === 'image' ? geminiOn() : (claudeOn() || geminiOn());
    var needLabel = kind === 'image' ? '제미나이 연결 필요' : 'AI 연결 필요';
    return '<div class="ai-enhance" data-aikind="' + kind + '">'
      + '<button class="btn btn-ai btn-sm" id="' + id + '"' + (ok ? '' : ' disabled') + '>'
      + '✨ ' + label + (ok ? '' : ' <span style="opacity:.8">· ' + needLabel + '</span>') + '</button>'
      + '<div class="ai-hint">' + (ok
          ? '<b>연결됨.</b> 누르면 AI가 ' + benefit
          : '기본 결과는 <b>지금도 나옵니다.</b> AI를 연결하면 ' + benefit + ' <button class="btn btn-xs btn-soft" data-openai="1" style="margin-left:4px">AI 연결하기</button>')
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
      + '<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:16px">AI를 연결하면 기획·카피·이미지를 <b>앱에서 바로 자동 생성</b>합니다. 연결 없이도 모든 기능(프롬프트 복사)은 그대로 씁니다.</p>'

      + '<div class="card" style="box-shadow:none;margin-bottom:14px">'
      + '<div class="oc-top" style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div class="oc-ico" style="width:30px;height:30px">✨</div>'
      + '<h3 style="font-size:15px;font-weight:800">제미나이 키 <span class="ai-tag">글·이미지 지금 가능</span></h3></div>'
      + '<p style="font-size:12.5px;color:var(--ink-2)">키 하나로 <b>글(기획·카피) + 이미지</b>를 지금 바로 자동 생성. 키 발급 무료(1분), <b>글은 무료 한도로 되고 이미지 생성은 구글 결제 등록</b>이 필요합니다. 키는 이 브라우저에만 저장됩니다.</p>'
      + '<div class="field" style="margin-top:10px"><input type="text" id="aiGeminiKey" placeholder="제미나이 API 키 붙여넣기" value="' + GF_UI.esc(s.geminiKey || '') + '"></div>'
      + '<div style="margin-top:8px;font-size:11.5px;color:var(--ink-3)">키 발급: aistudio.google.com → API 키 만들기' + (geminiOn() ? ' · <span style="color:var(--green);font-weight:700">연결됨</span>' : '') + '</div>'
      + '</div>'

      + '<div class="card" style="box-shadow:none;margin-bottom:6px">'
      + '<div class="oc-top" style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div class="oc-ico" style="width:30px;height:30px;background:#EDE7FF;color:#6A4BD6">🖥️</div>'
      + '<h3 style="font-size:15px;font-weight:800">Claude 구독 로그인 <span class="ai-tag">데스크톱 앱 예정</span></h3></div>'
      + '<p style="font-size:12.5px;color:var(--ink-2)"><b>본인 Claude 구독</b>으로 글을 더 좋은 품질로, <b>추가 비용 없이</b> 자동 작성. 단, 구독 로그인은 브라우저(웹)에선 불가하고 <b>데스크톱 앱(.exe)</b>에서만 됩니다 — 그래서 데스크톱 버전에서 제공됩니다. 그 전까지 글 자동화는 위 제미나이로 하시면 됩니다.</p>'
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

  /* ---- 제미나이 이미지 생성 (BYOK, 브라우저에서 직접 호출) ----
     대표님 키는 앱 AI 패널에 저장(브라우저 로컬). 텍스트 프롬프트 → 이미지 dataURL.
     모델명은 바뀔 수 있어 config로 뺌. CORS/키/모델 오류는 그대로 메시지로 전달. */
  var IMG_MODELS = ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview', 'gemini-2.0-flash-preview-image-generation'];

  function generateImage(prompt, modelIdx) {
    var key = state().geminiKey;
    if (!key) return Promise.reject(new Error('제미나이 키가 없습니다 (앱 AI 연결 패널에 입력)'));
    modelIdx = modelIdx || 0;
    var model = IMG_MODELS[modelIdx];
    if (!model) return Promise.reject(new Error('사용 가능한 이미지 모델을 찾지 못했습니다 (키·권한 확인)'));
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key);
    return fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } })
    }).then(function (res) {
      return res.json().then(function (j) { return { ok: res.ok, status: res.status, j: j }; });
    }).then(function (r) {
      if (!r.ok) {
        var msg = (r.j && r.j.error && r.j.error.message) || ('HTTP ' + r.status);
        /* 모델명이 안 맞으면 다음 후보로 재시도 */
        if ((r.status === 404 || /not found|not supported|responseModalities/i.test(msg)) && IMG_MODELS[modelIdx + 1]) {
          return generateImage(prompt, modelIdx + 1);
        }
        throw new Error(msg);
      }
      var cand = r.j.candidates && r.j.candidates[0];
      var parts = (cand && cand.content && cand.content.parts) || [];
      var imgPart = parts.filter(function (p) { return p.inlineData || p.inline_data; })[0];
      var inl = imgPart && (imgPart.inlineData || imgPart.inline_data);
      if (!inl) throw new Error('이미지가 반환되지 않았습니다 (프롬프트를 바꾸거나 이미지 지원 모델 키인지 확인)');
      return 'data:' + (inl.mimeType || inl.mime_type || 'image/png') + ';base64,' + inl.data;
    });
  }

  /* ---- 제미나이 글(텍스트) 생성 ---- */
  var TEXT_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  function generateText(prompt, modelIdx) {
    var key = state().geminiKey;
    if (!key) return Promise.reject(new Error('제미나이 키가 없습니다 (앱 AI 연결 패널에 입력)'));
    modelIdx = modelIdx || 0;
    var model = TEXT_MODELS[modelIdx];
    if (!model) return Promise.reject(new Error('사용 가능한 텍스트 모델을 찾지 못했습니다 (키·권한 확인)'));
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key);
    return fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }).then(function (res) {
      return res.json().then(function (j) { return { ok: res.ok, status: res.status, j: j }; });
    }).then(function (r) {
      if (!r.ok) {
        var msg = (r.j && r.j.error && r.j.error.message) || ('HTTP ' + r.status);
        if ((r.status === 404 || /not found|not supported/i.test(msg)) && TEXT_MODELS[modelIdx + 1]) return generateText(prompt, modelIdx + 1);
        throw new Error(msg);
      }
      var cand = r.j.candidates && r.j.candidates[0];
      var parts = (cand && cand.content && cand.content.parts) || [];
      var text = parts.map(function (p) { return p.text || ''; }).join('').trim();
      if (!text) throw new Error('응답이 비었습니다 (프롬프트를 바꿔보세요)');
      return text;
    });
  }

  return { refreshPill: refreshPill, openPanel: openPanel, enhanceBtn: enhanceBtn, bindEnhance: bindEnhance,
    claudeOn: claudeOn, geminiOn: geminiOn, anyOn: anyOn, generateImage: generateImage, generateText: generateText };
})();
