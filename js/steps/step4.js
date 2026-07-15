/* ============ 4단계: 디자인 방향 + 이미지 프롬프트 ============ */
var GF_STEP4 = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  function render(root) {
    var proj = GF_STORE.state.project;
    var d = proj.design;

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 4</span>'
      + '  <h1>디자인 · 이미지 프롬프트</h1>'
      + '  <p>디자인 방향을 정하면, 선택한 굿즈마다 이미지 생성 프롬프트가 자동으로 만들어집니다. 복사해서 제미나이·챗GPT 이미지 생성에 붙여넣으세요.</p>'
      + '</div>'

      + '<div class="card"><h3>추천 디자인 컨셉 — 골라만 주세요</h3>'
      + '<p class="desc">입력한 IP 종류·타깃에 맞춰 <b>분위기·스타일 방향</b>을 제안합니다. 여기 색은 <b>참고용 힌트</b>일 뿐, 굿즈를 자동으로 그리거나 원작 색을 바꾸지 않습니다. 이 방향이 아래 이미지 <b>프롬프트에 반영</b>돼요.</p>'
      + '<div class="concept-grid" id="conceptGrid"></div>'
      + '</div>'

      + '<div class="card"><h3>디자인 방향 (수정 가능)</h3>'
      + '<div class="note' + (d.keepColors !== false ? ' good' : '') + '" style="margin-top:0">'
      + '<label style="display:flex;gap:9px;align-items:flex-start;cursor:pointer;font-size:13px">'
      + '<input type="checkbox" id="d-keepColors"' + (d.keepColors !== false ? ' checked' : '') + ' style="margin-top:2px;width:16px;height:16px;accent-color:var(--green)">'
      + '<span><b>원작 캐릭터·브랜드 고유 색 유지</b> — 켜두면(기본) 이미 색이 정해진 IP(예: Bub=초록, Bob=파랑)는 그 색을 지키고, 아래 "메인 컬러"는 무시합니다. <b>끄면</b> 아래 색으로 바꿉니다(새 창작·색을 바꿀 때만).</span></label></div>'
      + '<div class="form-grid" style="margin-top:12px">'
      + '  <div class="field"><label>디자인 컨셉 <small>분위기·스타일 방향</small></label>'
      + '    <input type="text" id="d-concept" placeholder="예: 레트로 아케이드 감성, 도트 그래픽" value="' + esc(d.concept) + '"></div>'
      + '  <div class="field"><label>메인 컬러 <small>"원작 색 유지" 끌 때만 적용</small></label>'
      + '    <input type="text" id="d-palette" placeholder="예: 하늘색+노랑, #7EC8E3" value="' + esc(d.palette) + '"></div>'
      + '  <div class="field"><label>분위기 키워드</label>'
      + '    <input type="text" id="d-mood" placeholder="예: 아기자기한, 따뜻한, 키치한" value="' + esc(d.mood) + '"></div>'
      + '  <div class="field"><label>스타일 키워드 <small>일러스트 시안용</small></label>'
      + '    <input type="text" id="d-keywords" placeholder="예: 픽셀아트, 벡터 일러스트, 수채화" value="' + esc(d.keywords) + '"></div>'
      + '</div>'
      + '<hr class="divider">'
      + '<h3 style="font-size:14px">특수 후가공 · 재질 <small style="font-weight:400;color:var(--ink-3)">— 금·은·홀로그램 같은 굿즈 마감 (선택)</small></h3>'
      + '<p class="desc" style="margin:4px 0 8px">굿즈는 색만이 아니라 <b>재질·후가공</b>이 중요합니다. 원하는 마감을 누르거나 직접 쓰면 이미지 프롬프트에 반영됩니다. (원작 색 유지와 별개)</p>'
      + '<div class="chip-group" id="finishChips" style="margin-bottom:8px">'
      + ['골드(금박·도금)', '실버(은박)', '홀로그램', '글리터', '야광', '투명(클리어)', '무광', '유광 에폭시'].map(function (f) {
          return '<button class="chip" data-finish="' + esc(f) + '">' + esc(f) + '</button>';
        }).join('')
      + '</div>'
      + '<div class="field"><input type="text" id="d-finish" placeholder="예: 골드 도금 테두리 + 홀로그램 인쇄" value="' + esc(d.finish || '') + '"></div>'
      + '<div class="note" style="margin-top:12px"><b>팁:</b> 실제 IP 이미지(원작 스프라이트·공식 일러스트)가 있다면 프롬프트와 함께 <b>레퍼런스 이미지로 첨부</b>하세요(아래 "레퍼런스 이미지"). 원작 색·형태가 훨씬 정확해집니다.</div>'
      + '</div>'

      + '<div class="card"><h3>레퍼런스 이미지 <small style="font-weight:400;color:var(--ink-3)">— 선택</small></h3>'
      + '<p class="desc">어디서 본 괜찮은 <b>제품</b> 사진이나, 적용하고 싶은 <b>디자인</b> 예시를 넣어두세요. 생성 프롬프트에 "이 레퍼런스처럼" 지시가 자동으로 붙고, AI에 프롬프트와 함께 이 이미지를 첨부하면 훨씬 비슷하게 나옵니다.</p>'
      + '<div style="display:flex; gap:8px; margin-bottom:12px">'
      + '<button class="btn btn-sm btn-soft" id="btnAddProductRef">+ 제품 레퍼런스</button>'
      + '<button class="btn btn-sm btn-soft" id="btnAddDesignRef">+ 디자인 레퍼런스</button>'
      + '<input type="file" id="refFile" accept="image/*" class="hidden">'
      + '</div>'
      + '<div id="refList" class="cut-list"></div>'
      + '</div>'

      + '<div class="card"><h3>컷 종류 선택</h3>'
      + '<p class="desc">굿즈마다 어떤 용도의 이미지를 만들지 고르세요. 복수 선택하면 굿즈 × 컷 종류만큼 프롬프트가 나옵니다.</p>'
      + '<div class="chip-group" id="styleChips">'
      + GF_PROMPTS.imageStyles.map(function (s) {
          var on = (d.styleId || 'product').split(',').indexOf(s.id) >= 0;
          return '<button class="chip' + (on ? ' on' : '') + '" data-style="' + s.id + '" title="' + esc(s.desc) + '">' + esc(s.name) + '</button>';
        }).join('')
      + '</div></div>'

      + '<div class="card"><h3>생성된 이미지 프롬프트</h3>'
      + '<p class="desc">아래 프롬프트는 "용도 선언" 문법으로 작성됩니다 — 어디에 쓸 이미지인지 먼저 선언하면 AI가 결과물의 완성도를 스스로 상업용 수준으로 맞춥니다.</p>'
      + GF_AI.enhanceBtn('aiEnhStep4', '프롬프트로 이미지 일괄 생성', 'image', '이 프롬프트들로 굿즈 시안 이미지를 앱에서 바로, 여러 장 자동 생성해 상세페이지에 넣어줍니다.')
      + '<div id="genProgress" style="margin-top:10px"></div>'
      + '<div id="genGallery" style="margin-top:12px"></div>'
      + '<div id="imgPrompts" style="margin-top:14px"></div></div>'

      + '<div class="card"><h3>디자인 컨셉 잡기 프롬프트 (텍스트)</h3><div id="p4-prompts"></div></div>'

      + GF_EXPORT_STEPDOC.barHtml(4)

      + '<div class="step-footer">'
      + '  <button class="btn btn-ghost" id="btnPrev4">← 굿즈 선정</button>'
      + '  <button class="btn btn-primary" id="btnNext4">다음 → 산출물 만들기</button>'
      + '</div>';

    root.innerHTML = html;
    GF_EXPORT_STEPDOC.bindBar(4);
    renderConcepts();

    ['concept', 'palette', 'mood', 'keywords'].forEach(function (key) {
      var inp = $('#d-' + key);
      inp.addEventListener('input', function () { d[key] = this.value; GF_STORE.save(); });
      inp.addEventListener('blur', renderImgPrompts);
    });
    var kc = $('#d-keepColors');
    if (kc) kc.addEventListener('change', function () {
      d.keepColors = this.checked; GF_STORE.save(); renderImgPrompts();
      var note = this.closest('.note'); if (note) note.classList.toggle('good', this.checked);
      GF_UI.toast(this.checked ? '원작 캐릭터·브랜드 색을 유지합니다' : '아래 "메인 컬러"로 바꿔 생성합니다');
    });
    var finInp = $('#d-finish');
    if (finInp) finInp.addEventListener('input', function () { d.finish = this.value; GF_STORE.save(); renderImgPrompts(); });
    GF_UI.$all('#finishChips .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-finish');
        var cur = (d.finish || '').trim();
        var on = cur.indexOf(f) >= 0;
        if (on) { cur = cur.split(/\s*[,+]\s*/).filter(function (x) { return x && x !== f; }).join(' + '); }
        else { cur = cur ? cur + ' + ' + f : f; }
        d.finish = cur; GF_STORE.save();
        if (finInp) finInp.value = cur;
        chip.classList.toggle('on', !on);
        renderImgPrompts();
      });
    });

    GF_UI.$all('[data-style]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var id = chip.getAttribute('data-style');
        var cur = (d.styleId || 'product').split(',').filter(Boolean);
        var idx = cur.indexOf(id);
        if (idx >= 0) cur.splice(idx, 1); else cur.push(id);
        if (!cur.length) cur = ['product'];
        d.styleId = cur.join(',');
        GF_STORE.save();
        GF_UI.$all('[data-style]').forEach(function (c) {
          c.classList.toggle('on', cur.indexOf(c.getAttribute('data-style')) >= 0);
        });
        renderImgPrompts();
      });
    });

    renderImgPrompts();
    renderRefs();
    GF_AI.bindEnhance(root);
    renderGallery();
    var enh4 = $('#aiEnhStep4');
    if (enh4) enh4.addEventListener('click', function () {
      if (!GF_AI.geminiOn()) { GF_AI.openPanel(); return; }
      confirmGenerate();
    });

    /* 레퍼런스 이미지 업로드 */
    var pendingKind = 'product';
    $('#btnAddProductRef').addEventListener('click', function () { pendingKind = 'product'; $('#refFile').click(); });
    $('#btnAddDesignRef').addEventListener('click', function () { pendingKind = 'design'; $('#refFile').click(); });
    $('#refFile').addEventListener('change', function () {
      if (!this.files[0]) return;
      GF_UI.readImage(this.files[0], 900, function (dataUrl) {
        proj.refs = proj.refs || [];
        proj.refs.push({ img: dataUrl, kind: pendingKind, memo: '' });
        GF_STORE.save();
        renderRefs();
        renderImgPrompts();
        GF_UI.toast((pendingKind === 'product' ? '제품' : '디자인') + ' 레퍼런스를 추가했습니다');
      });
      this.value = '';
    });

    var box4 = $('#p4-prompts');
    box4.innerHTML = GF_UI.promptListHtml(GF_PROMPTS.step4text(GF_STEP1.promptCtx(), GF_STEP3.goodsNames()), 's4t-');
    GF_UI.bindPromptCopy(box4);

    $('#btnPrev4').addEventListener('click', function () { GF_APP.go(3); });
    $('#btnNext4').addEventListener('click', function () { GF_APP.go(5); });
  }

  /* 레퍼런스 이미지 목록 */
  function renderRefs() {
    var proj = GF_STORE.state.project;
    var box = $('#refList');
    if (!box) return;
    proj.refs = proj.refs || [];
    if (!proj.refs.length) {
      box.innerHTML = '<p style="color:var(--ink-3);font-size:12.5px">아직 없음 — 참고할 제품/디자인 이미지가 있으면 추가하세요.</p>';
      return;
    }
    box.innerHTML = proj.refs.map(function (r, i) {
      return '<div class="cut-row">'
        + '<div class="cut-thumb"><img src="' + r.img + '"></div>'
        + '<div class="cut-fields">'
        + '<div style="font-size:12.5px;font-weight:700;color:' + (r.kind === 'product' ? 'var(--accent-deep)' : 'var(--blue)') + '">'
        + (r.kind === 'product' ? '제품 레퍼런스' : '디자인 레퍼런스') + '</div>'
        + '<input type="text" data-refmemo="' + i + '" value="' + esc(r.memo || '') + '" placeholder="메모 (예: 이 구성/배색이 마음에 듦)">'
        + '</div>'
        + '<button class="btn btn-xs btn-ghost" data-refdel="' + i + '">삭제</button></div>';
    }).join('');
    GF_UI.$all('[data-refmemo]', box).forEach(function (inp) {
      inp.addEventListener('input', function () { proj.refs[Number(inp.getAttribute('data-refmemo'))].memo = this.value; GF_STORE.save(); });
    });
    GF_UI.$all('[data-refdel]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        proj.refs.splice(Number(btn.getAttribute('data-refdel')), 1);
        GF_STORE.save(); renderRefs(); renderImgPrompts();
      });
    });
  }

  /* 추천 컨셉 카드 — 프로그램이 먼저 제안 */
  function renderConcepts() {
    var proj = GF_STORE.state.project;
    var d = proj.design;
    var grid = $('#conceptGrid');
    if (!grid) return;
    var ranked = gfRankConcepts(proj.plan.ipType, proj.plan.target);
    grid.innerHTML = ranked.map(function (c, i) {
      var picked = d.concept && d.concept.indexOf(c.name) === 0;
      return '<div class="concept-card' + (picked ? ' picked' : '') + '" data-concept="' + c.id + '">'
        + (i < 3 && !picked ? '<span class="c-badge">추천</span>' : '')
        + '<div class="c-name">' + esc(c.name) + '</div>'
        + '<div class="c-mood">' + esc(c.mood) + '</div>'
        + '<div class="c-pal">' + c.palette.map(function (hex) { return '<span style="background:' + hex + '"></span>'; }).join('') + '</div>'
        + '</div>';
    }).join('');
    GF_UI.$all('[data-concept]', grid).forEach(function (card) {
      card.addEventListener('click', function () {
        var cid = card.getAttribute('data-concept');
        var c = null;
        GF_CONCEPTS.forEach(function (x) { if (x.id === cid) c = x; });
        if (!c) return;
        d.concept = c.name + ' — ' + c.mood;
        d.palette = c.paletteText + ' (' + c.palette.join(', ') + ')';
        d.mood = c.mood;
        d.keywords = c.keywords;
        GF_STORE.save();
        /* 입력칸에 즉시 반영 (파일 선택=즉시 적용과 같은 원칙) */
        $('#d-concept').value = d.concept;
        $('#d-palette').value = d.palette;
        $('#d-mood').value = d.mood;
        $('#d-keywords').value = d.keywords;
        renderConcepts();
        renderImgPrompts();
        GF_UI.toast('"' + c.name + '" 컨셉을 적용했습니다 — 아래 항목에서 수정 가능');
      });
    });
  }

  /* 선택 굿즈 × 선택 컷 종류 → 품목별 프롬프트 생성 */
  function buildImagePrompts() {
    var proj = GF_STORE.state.project;
    var d = proj.design;
    var plan = proj.plan;
    var styleIds = (d.styleId || 'detail').split(',').filter(Boolean);
    var out = [];

    var refHint = '';
    var hasProductRef = (proj.refs || []).some(function (r) { return r.kind === 'product'; });
    var hasDesignRef = (proj.refs || []).some(function (r) { return r.kind === 'design'; });
    if (hasProductRef) refHint += ' (첨부한 제품 레퍼런스 사진의 형태·구성을 참고해서 우리 IP로 바꿔)';
    if (hasDesignRef) refHint += ' (첨부한 디자인 레퍼런스의 스타일·배색을 우리 것에 적용해서)';

    var ipLine = plan.ipName
      ? '"' + plan.ipName + '" IP 굿즈이고' + (plan.ipDesc ? ' (' + plan.ipDesc + ')' : '') + (d.concept ? ', 디자인 컨셉은 ' + d.concept + '.' : '.')
      : (d.concept ? '디자인 컨셉은 ' + d.concept + '.' : '');
    /* 원작 색 유지 여부 — 기존 IP는 캐릭터/브랜드 고유 색을 지키는 게 기본 */
    var keep = d.keepColors !== false;
    ipLine += keep ? ' 원작 캐릭터·브랜드 고유 색은 그대로 지켜줘.' : (d.palette ? ' 전체 색감은 ' + d.palette + ' 계열로.' : '');
    if (d.finish && d.finish.trim()) ipLine += ' 특수 후가공·재질은 ' + d.finish.trim() + '로 표현해줘(실제 그 재질 질감이 살게).';
    ipLine += refHint;

    var tone = GF_TARGET_TONE[plan.target] || GF_TARGET_TONE.general;

    proj.goods.forEach(function (g) {
      var c = GF_STORE.catalogById(g.catalogId);
      if (!c) return;
      var det = gfItemDetail(c);
      styleIds.forEach(function (sid) {
        var style = null;
        GF_PROMPTS.imageStyles.forEach(function (s) { if (s.id === sid) style = s; });
        if (!style) return;
        var ctx = {
          goodsName: (plan.ipName ? plan.ipName + ' ' : '') + c.name,
          ipLine: ipLine, material: c.spec,
          mood: d.mood, palette: keep ? '' : d.palette, styleLine: d.keywords,
          views: det.views,
          appeals: (det.appeals || []).concat(d.keywords ? [d.keywords] : []).join(', '),
          tone: tone, guard: GF_IMG_GUARD
        };
        out.push({
          title: c.name + ' — ' + style.name,
          use: '제미나이(나노바나나)·챗GPT 이미지 생성 — 가능하면 IP·레퍼런스 이미지 첨부',
          text: style.build(ctx)
        });
      });
    });
    return out;
  }

  function renderImgPrompts() {
    var box = $('#imgPrompts');
    if (!box) return;
    var prompts = buildImagePrompts();
    if (!prompts.length) {
      box.innerHTML = '<p style="color:var(--ink-3); font-size:13.5px">3단계에서 굿즈를 선택하면 프롬프트가 자동 생성됩니다.</p>';
      return;
    }
    box.innerHTML = '<div style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:10px">'
      + '<button class="btn btn-dark btn-sm" id="btnCopyAllPrompts">프롬프트 ' + prompts.length + '개 전체 복사</button>'
      + '<button class="btn btn-primary btn-sm" id="btnDownPrompts">프롬프트 파일 저장 (.txt)</button></div>'
      + GF_UI.promptListHtml(prompts, 's4i-');
    GF_UI.bindPromptCopy(box);
    $('#btnCopyAllPrompts').addEventListener('click', function () {
      var all = prompts.map(function (p, i) { return '【' + (i + 1) + '. ' + p.title + '】\n' + p.text; }).join('\n\n----------------\n\n');
      GF_UI.copyText(all, '프롬프트 전체를 복사했습니다');
    });
    $('#btnDownPrompts').addEventListener('click', downloadAllPrompts);
  }

  /* 전 단계 프롬프트를 한 텍스트 파일로 저장 (이미지 프롬프트 포함) */
  function downloadAllPrompts() {
    var proj = GF_STORE.state.project;
    var ctx = GF_STEP1.promptCtx();
    var names = GF_STEP3.goodsNames();
    var groups = [
      { name: '1단계 — 기획', list: GF_PROMPTS.step1(ctx) },
      { name: '2단계 — 시장조사', list: GF_PROMPTS.step2(ctx) },
      { name: '3단계 — 굿즈 구성', list: GF_PROMPTS.step3(ctx, names) },
      { name: '4단계 — 디자인 컨셉', list: GF_PROMPTS.step4text(ctx, names) },
      { name: '4단계 — 이미지 생성 (제미나이·챗GPT 이미지 모드에 붙여넣기)', list: buildImagePrompts() },
      { name: '5단계 — 산출물 다듬기', list: GF_PROMPTS.step5(ctx) }
    ];
    var out = '===============================================\n'
      + ' 굿즈 팩토리 — AI 프롬프트 모음\n'
      + ' 프로젝트: ' + (proj.name || '') + (proj.plan.ipName ? ' / IP: ' + proj.plan.ipName : '') + '\n'
      + ' 생성일: ' + GF_UI.today() + '\n'
      + ' 사용법: 아래 프롬프트를 복사해 본인 챗GPT·제미나이·클로드 채팅창에 붙여넣으세요.\n'
      + '        이미지 프롬프트는 IP 원본 이미지를 함께 첨부하면 훨씬 좋아집니다.\n'
      + '===============================================\n';
    groups.forEach(function (grp) {
      if (!grp.list.length) return;
      out += '\n\n■■■ ' + grp.name + ' (' + grp.list.length + '개) ■■■\n';
      grp.list.forEach(function (p, i) {
        out += '\n【' + (i + 1) + '. ' + p.title + '】 — 붙여넣을 곳: ' + (p.use || 'AI 채팅창') + '\n'
          + '-----------------------------------------------\n'
          + p.text + '\n';
      });
    });
    var name = (proj.plan.ipName || proj.name || '굿즈').replace(/[\\/:*?"<>|]/g, '_');
    GF_UI.download('프롬프트모음_' + name + '_' + GF_UI.today() + '.txt', out, 'text/plain;charset=utf-8');
    GF_UI.toast('프롬프트 전체를 .txt 파일로 저장했습니다');
  }

  /* ---- 제미나이 이미지 생성 실행 ---- */
  function confirmGenerate() {
    var prompts = buildImagePrompts();
    if (!prompts.length) { GF_UI.toast('3단계에서 굿즈를 먼저 선택하세요'); return; }
    GF_UI.openModal('AI 이미지 생성',
      '<p style="font-size:14px">이 프롬프트 <b>' + prompts.length + '장</b>을 제미나이로 생성합니다.</p>'
      + '<p style="font-size:12.5px;color:var(--ink-3);margin-top:6px">대표님 제미나이 키로 호출되며 <b>이미지 생성은 구글 결제(비용)</b>가 발생할 수 있습니다. 순서대로 생성되고 결과는 아래 갤러리에 쌓입니다. 컷 종류를 줄이면 장수가 줄어듭니다.</p>'
      + '<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="gCancel">취소</button><button class="btn btn-primary btn-sm" id="gGo">' + prompts.length + '장 생성</button></div>');
    $('#gCancel').addEventListener('click', GF_UI.closeModal);
    $('#gGo').addEventListener('click', function () { GF_UI.closeModal(); runGeneration(prompts); });
  }

  function runGeneration(prompts) {
    var proj = GF_STORE.state.project;
    var prog = $('#genProgress');
    var i = 0, okc = 0;
    function next() {
      if (i >= prompts.length) {
        prog.innerHTML = '<div class="note good">완료 — ' + okc + '/' + prompts.length + '장 생성. 아래 갤러리에서 "히어로/컷 추가"로 상세페이지에 넣으세요.</div>';
        GF_STORE.save(); renderGallery(); return;
      }
      var p = prompts[i];
      if (prog) prog.innerHTML = '<div class="note">생성 중… (' + (i + 1) + '/' + prompts.length + ') ' + esc(p.title) + '</div>';
      GF_AI.generateImage(p.text).then(function (dataUrl) {
        var im = new Image();
        im.onload = function () {
          var scale = Math.min(1, 900 / im.width);
          var cv = document.createElement('canvas'); cv.width = Math.round(im.width * scale); cv.height = Math.round(im.height * scale);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          proj.genImages.push({ img: cv.toDataURL('image/jpeg', 0.85), title: p.title });
          okc++; i++; GF_STORE.save(); renderGallery(); next();
        };
        im.onerror = function () { proj.genImages.push({ img: dataUrl, title: p.title }); okc++; i++; GF_STORE.save(); renderGallery(); next(); };
        im.src = dataUrl;
      }).catch(function (err) {
        if (prog) prog.innerHTML = '<div class="note warn"><b>생성 중단 — ' + esc(String((err && err.message) || err)) + '</b><br>제미나이 키·이미지 권한·결제 등록을 확인하세요. (여기까지 ' + okc + '장 성공, 갤러리에 저장됨)</div>';
        GF_STORE.save(); renderGallery();
      });
    }
    next();
  }

  function renderGallery() {
    var box = $('#genGallery'); if (!box) return;
    var proj = GF_STORE.state.project; var imgs = proj.genImages || [];
    if (!imgs.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div style="font-size:12.5px;font-weight:700;margin-bottom:8px">생성된 이미지 (' + imgs.length + ') — 상세페이지에 바로 넣기</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">'
      + imgs.map(function (g, idx) {
          return '<div style="border:1px solid var(--line);border-radius:var(--r-sm);overflow:hidden;background:#fff">'
            + '<img src="' + g.img + '" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block">'
            + '<div style="padding:6px 8px"><div style="font-size:10.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(g.title) + '</div>'
            + '<div style="display:flex;gap:4px;margin-top:5px;flex-wrap:wrap">'
            + '<button class="btn btn-xs btn-soft" data-genhero="' + idx + '">히어로</button>'
            + '<button class="btn btn-xs btn-ghost" data-gencut="' + idx + '">컷 추가</button>'
            + '<button class="btn btn-xs btn-ghost" data-gendel="' + idx + '">삭제</button></div></div></div>';
        }).join('')
      + '</div>';
    GF_UI.$all('[data-genhero]', box).forEach(function (b) { b.addEventListener('click', function () { proj.detail.heroImg = imgs[Number(b.getAttribute('data-genhero'))].img; GF_STORE.save(); GF_UI.toast('상세페이지 히어로로 넣었습니다'); }); });
    GF_UI.$all('[data-gencut]', box).forEach(function (b) { b.addEventListener('click', function () { var g = imgs[Number(b.getAttribute('data-gencut'))]; proj.detail.cuts.push({ img: g.img, label: g.title, caption: '' }); GF_STORE.save(); GF_UI.toast('상세페이지 컷으로 추가했습니다'); }); });
    GF_UI.$all('[data-gendel]', box).forEach(function (b) { b.addEventListener('click', function () { imgs.splice(Number(b.getAttribute('data-gendel')), 1); GF_STORE.save(); renderGallery(); }); });
  }

  return { render: render, buildImagePrompts: buildImagePrompts };
})();
