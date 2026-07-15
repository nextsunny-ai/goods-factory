/* ============ 7단계: 산출물 (상세페이지 편집 + 문서 분리 출력) ============ */
var GF_STEP5 = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  /* 산출물 정의 — 그룹별 */
  function outputs() {
    return {
      client: [
        { key: 'plan', ico: '📋', title: '굿즈 기획안', desc: '기획 개요·시장·라인업·컨셉·일정 요약. 내부 공유·클라이언트 제출용.', ex: GF_EXPORT_PLAN },
        { key: 'designquote', ico: '🎨', title: '디자인 제안 + 견적', desc: '컨셉·목업·굿즈별 견적을 함께. 디자인 방향과 가격을 한 문서로.', ex: GF_EXPORT_DESIGNQUOTE },
        { key: 'quote', ico: '🧾', title: '견적서', desc: '고객 제출용 정식 견적서. 공급가·부가세·유효기간·결제조건 포함.', ex: GF_EXPORT_QUOTE },
        { key: 'schedule', ico: '🗓️', title: '제작 스케줄표', desc: '굿즈별 단계 일정·완료 예상일. 6단계 스케줄 기준으로 생성.', ex: GF_EXPORT_SCHEDULE }
      ],
      make: [
        { key: 'detail', ico: '🛍️', title: '상세페이지', desc: '쇼핑몰 등록용. 아래 편집 내용으로 생성. 캡처하면 이미지 상세페이지로도 활용.', ex: GF_EXPORT_DETAIL },
        { key: 'order', ico: '📦', title: '발주서', desc: '제작처 발송용. 제작처를 고르면 수신처·해당 품목이 채워집니다.', ex: GF_EXPORT_ORDER, vendor: true, csv: true }
      ],
      etc: [
        { key: 'proposal', ico: '📈', title: '사업 제안서', desc: '라이선스사·투자·입점 제출용 종합 제안서.', ex: GF_EXPORT_PROPOSAL, mail: true },
        { key: 'master', ico: '🗂️', title: '종합 문서', desc: '기획·시장·구성·마진·프롬프트 전체가 담긴 한 파일.', ex: GF_EXPORT_MASTER }
      ]
    };
  }

  function render(root) {
    var proj = GF_STORE.state.project;
    var dt = proj.detail;
    if (!dt.title && proj.goods.length) {
      var first = GF_STORE.catalogById(proj.goods[0].catalogId);
      if (first && proj.plan.ipName) dt.title = proj.plan.ipName + ' ' + first.name;
    }
    var vendors = GF_STORE.state.settings.vendors;

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 7</span>'
      + '  <h1>산출물</h1>'
      + '  <p>보통 실무에서 나가는 문서들을 <b>따로따로</b> 뽑을 수 있습니다. "열기"로 앱 안에서 보면서 직접 고치고, HTML로 저장해 인쇄(PDF)하세요.</p>'
      + '</div>';

    /* 제안서·기획안·디자인제안 디자인 양식 선택 */
    html += '<div class="card"><h3>제출 문서 디자인 양식</h3>'
      + '<p class="desc">기획안·디자인 제안·사업 제안서에 적용됩니다. 같은 내용, 비주얼만 달라집니다. (타깃에 맞춰 고르세요)</p>'
      + '<div class="chip-group" id="proposalStyle">'
      + Object.keys(GF_DOC_THEMES).map(function (id) {
          var t = GF_DOC_THEMES[id];
          var on = (proj.proposalStyle || 'basic') === id;
          return '<button class="chip' + (on ? ' on' : '') + '" data-pstyle="' + id + '" title="' + esc(t.desc) + '">' + esc(t.name) + '</button>';
        }).join('')
      + '</div>'
      + '<p class="desc" id="pstyleDesc" style="margin:10px 0 0"></p>'
      + '</div>';

    var o = outputs();
    html += group('고객 제출용', o.client, vendors)
      + group('제작·판매용', o.make, vendors)
      + group('기타', o.etc, vendors);

    /* 진행 상태 */
    var pg = proj.progress;
    html += '<div class="card"><h2>진행 상태 — 컨펌받고 발주하기</h2>'
      + '<p class="desc">실제 업무 순서입니다. 끝낸 단계를 눌러 체크하세요.</p>'
      + '<div class="flow-steps">'
      + flow('sent', '1. 제안·견적 발송', '클라이언트에 기획안·견적 전달', pg.sent)
      + flow('confirmed', '2. 컨펌 받음', '구성·수량·가격 확정', pg.confirmed)
      + flow('ordered', '3. 발주 완료', '제작처 발주 + 샘플 일정 확인', pg.ordered)
      + '</div></div>';

    /* 상세페이지 편집 */
    html += detailEditor(dt);

    html += '<div class="step-footer">'
      + '<button class="btn btn-ghost" id="btnPrev5">← 스케줄</button>'
      + '<span class="hint">모든 산출물은 현재 입력 내용 기준으로 실시간 생성됩니다</span></div>';

    root.innerHTML = html;
    bindOutputs(o);
    bindProgress();
    bindDetail(dt);
    renderCuts(); renderFeatures();
    bindProposalStyle();
    $('#btnPrev5').addEventListener('click', function () { GF_APP.go(6); });
  }

  function group(title, arr, vendors) {
    var h = '<div class="card"><h2>' + esc(title) + '</h2><div class="output-grid">';
    arr.forEach(function (o) {
      h += '<div class="output-card"><div class="oc-top"><div class="oc-ico">' + o.ico + '</div><h3>' + esc(o.title) + '</h3></div>'
        + '<p>' + esc(o.desc) + '</p><div class="out-actions">';
      if (o.vendor) {
        h += '<select id="vendorSel" style="padding:6px 10px;border:1px solid var(--line-2);border-radius:var(--r-xs);font-size:13px">'
          + '<option value="">제작처 선택</option>'
          + vendors.map(function (v, i) { return '<option value="' + i + '">' + esc(v.name) + (v.type ? ' (' + esc(v.type) + ')' : '') + '</option>'; }).join('') + '</select>';
      }
      h += '<button class="btn btn-soft btn-sm" data-open="' + o.key + '">열기·수정</button>'
        + '<button class="btn btn-primary btn-sm" data-down="' + o.key + '">HTML 저장</button>';
      if (o.csv) h += '<button class="btn btn-ghost btn-sm" data-csv="' + o.key + '">엑셀(CSV)</button>';
      if (o.mail) h += '<button class="btn btn-ghost btn-sm" data-mail="1">발송 메일 문구</button>';
      h += '</div></div>';
    });
    h += '</div></div>';
    return h;
  }

  function flow(key, name, desc, on) {
    return '<div class="flow-step' + (on ? ' on' : '') + '" data-flow="' + key + '"><span class="f-check">' + (on ? '✅' : '⬜') + '</span>'
      + '<span><span class="f-name">' + name + '</span><br><span class="f-desc">' + desc + '</span></span></div>';
  }

  function pickedVendor() {
    var sel = $('#vendorSel');
    if (!sel || sel.value === '') return null;
    return GF_STORE.state.settings.vendors[Number(sel.value)];
  }
  function buildOf(o) {
    if (o.key === 'order') return function () { return GF_EXPORT_ORDER.build(pickedVendor()); };
    return o.ex.build;
  }
  function htmlOf(o) {
    var edits = GF_STORE.state.project.docEdits;
    return edits[o.key] || buildOf(o)();
  }

  function bindOutputs(o) {
    var all = o.client.concat(o.make, o.etc);
    var map = {}; all.forEach(function (x) { map[x.key] = x; });

    GF_UI.$all('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = map[b.getAttribute('data-open')];
        GF_VIEWER.open({ docKey: x.key, title: x.title, buildFn: buildOf(x), fileName: x.ex.fileName ? x.ex.fileName() : (x.key + '.html') });
      });
    });
    GF_UI.$all('[data-down]').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = map[b.getAttribute('data-down')];
        if (x.key === 'order' && !GF_STORE.state.project.goods.length) { GF_UI.toast('굿즈를 먼저 선택해주세요'); return; }
        GF_UI.download(x.ex.fileName(), htmlOf(x), 'text/html;charset=utf-8');
        GF_UI.toast(x.title + ' 저장' + (GF_STORE.state.project.docEdits[x.key] ? ' (수정본)' : ''));
      });
    });
    GF_UI.$all('[data-csv]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!GF_STORE.state.project.goods.length) { GF_UI.toast('굿즈를 먼저 선택해주세요'); return; }
        GF_UI.download(GF_EXPORT_ORDER.fileName('csv'), GF_EXPORT_ORDER.buildCsv(), 'text/csv;charset=utf-8');
        GF_UI.toast('발주 내역 CSV를 저장했습니다');
      });
    });
    var mail = $('[data-mail]');
    if (mail) mail.addEventListener('click', function () {
      var plan = GF_STORE.state.project.plan, co = GF_STORE.state.settings.company;
      var m = '제목: [' + (co.name || '회사명') + '] ' + (plan.ipName || 'IP') + ' 굿즈 제안서 송부의 건\n\n'
        + '안녕하세요, ' + (co.name || '(회사명)') + ' ' + (co.ceo ? co.ceo + ' 대표' : '(담당자명)') + '입니다.\n\n'
        + '말씀 나눈 ' + (plan.ipName || 'IP') + ' 굿즈 건 제안서와 견적을 첨부해 드립니다. 검토 부탁드리며, 컨펌 주시면 샘플 제작부터 진행하겠습니다.\n\n'
        + '감사합니다.\n' + (co.name || '') + (co.contact ? ' / ' + co.contact : '') + (co.email ? ' / ' + co.email : '');
      GF_UI.copyText(m, '발송 메일 문구를 복사했습니다');
    });
  }

  function bindProposalStyle() {
    var proj = GF_STORE.state.project;
    function upd() { var t = GF_DOC_THEMES[proj.proposalStyle || 'basic']; var d = $('#pstyleDesc'); if (d) d.textContent = t ? t.desc : ''; }
    upd();
    GF_UI.$all('[data-pstyle]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        proj.proposalStyle = chip.getAttribute('data-pstyle');
        /* 스타일 바꾸면 해당 문서들의 수정본은 원본 재생성 기준으로 (스타일 반영 위해) */
        ['plan', 'designquote', 'proposal'].forEach(function (k) { if (proj.docEdits[k]) { proj.docEdits[k + '_이전수정본'] = proj.docEdits[k]; delete proj.docEdits[k]; } });
        GF_STORE.save();
        GF_UI.$all('[data-pstyle]').forEach(function (c) { c.classList.toggle('on', c === chip); });
        upd();
        GF_UI.toast('"' + GF_DOC_THEMES[proj.proposalStyle].name + '" 양식을 적용했습니다');
      });
    });
  }

  function bindProgress() {
    GF_UI.$all('[data-flow]').forEach(function (el) {
      el.addEventListener('click', function () {
        var k = el.getAttribute('data-flow');
        GF_STORE.state.project.progress[k] = !GF_STORE.state.project.progress[k];
        GF_STORE.save(); render($('#content'));
      });
    });
  }

  /* ---- 상세페이지 편집 (v1.1 유지) ---- */
  function detailEditor(dt) {
    return '<div class="card"><h2>상세페이지 편집</h2>'
      + '<p class="desc">위 "상세페이지" 산출물에 반영됩니다. 비운 항목은 자동 생략됩니다.</p>'
      + '<div class="form-grid">'
      + '<div class="field"><label>상품명</label><input type="text" id="dt-title" value="' + esc(dt.title) + '" placeholder="예: 버블보블 미니 아케이드 캐비닛 열쇠고리"></div>'
      + '<div class="field"><label>감성 서브카피</label><input type="text" id="dt-subtitle" value="' + esc(dt.subtitle) + '" placeholder="예: 손톱만 한 캐비닛에 담긴 레트로 게임의 추억"></div>'
      + '<div class="field"><label>판매가 표기</label><input type="text" id="dt-price" value="' + esc(dt.price) + '" placeholder="예: 15,000원"></div>'
      + '<div class="field"><label>구성 옵션</label><input type="text" id="dt-options" value="' + esc(dt.options) + '" placeholder="예: 단품 / 2개 세트 28,000원"></div>'
      + '</div>'
      + '<hr class="divider"><h3>메인 컷</h3>'
      + '<div class="cut-row"><div class="cut-thumb" id="heroThumb">' + (dt.heroImg ? '<img src="' + dt.heroImg + '">' : '클릭해서<br>이미지 선택') + '</div>'
      + '<div class="cut-fields"><span style="font-size:12.5px;color:var(--ink-3)">상세페이지 최상단 대표 이미지. 목업이나 시안을 넣으세요.</span></div>'
      + '<button class="btn btn-xs btn-ghost" id="heroClear">비우기</button></div>'
      + '<input type="file" id="heroFile" accept="image/*" class="hidden">'
      + '<hr class="divider"><h3>상세 컷</h3><div class="cut-list" id="cutList"></div>'
      + '<button class="btn btn-sm btn-ghost" id="btnAddCut" style="margin-top:10px">+ 컷 추가</button>'
      + '<hr class="divider"><h3>★ 매력 포인트 <small style="font-weight:400;color:var(--ink-3)">최대 5개</small></h3><div id="featList"></div>'
      + '<hr class="divider"><h3>기본 사양</h3><div class="form-grid">'
      + '<div class="field"><label>사이즈</label><input type="text" id="sp-size" value="' + esc(dt.specs.size) + '" placeholder="예: 약 H55 x W35 x D40 mm"></div>'
      + '<div class="field"><label>재질</label><input type="text" id="sp-material" value="' + esc(dt.specs.material) + '" placeholder="예: ABS + LED"></div>'
      + '<div class="field"><label>전원</label><input type="text" id="sp-power" value="' + esc(dt.specs.power) + '" placeholder="예: 버튼셀 LR44 x 2"></div>'
      + '<div class="field"><label>구성</label><input type="text" id="sp-contents" value="' + esc(dt.specs.contents) + '" placeholder="예: 본체, 사용설명서"></div>'
      + '<div class="field full"><label>인증 정보 <small>KC 등</small></label><input type="text" id="sp-cert" value="' + esc(dt.specs.cert) + '" placeholder="예: KC 인증번호 (14세 이상)"></div>'
      + '</div>'
      + '<hr class="divider"><h3>구매 안내</h3><div class="form-grid">'
      + '<div class="field full"><label>배송 안내</label><textarea id="dt-shipping">' + esc(dt.shipping) + '</textarea></div>'
      + '<div class="field full"><label>교환·반품</label><textarea id="dt-refund">' + esc(dt.refund) + '</textarea></div>'
      + '<div class="field full"><label>취급 주의사항</label><textarea id="dt-caution">' + esc(dt.caution) + '</textarea></div>'
      + '</div></div>';
  }

  function bindDetail(dt) {
    function bf(id, obj, key) { var e = $('#' + id); if (e) e.addEventListener('input', function () { obj[key] = this.value; GF_STORE.save(); }); }
    bf('dt-title', dt, 'title'); bf('dt-subtitle', dt, 'subtitle'); bf('dt-price', dt, 'price'); bf('dt-options', dt, 'options');
    bf('dt-shipping', dt, 'shipping'); bf('dt-refund', dt, 'refund'); bf('dt-caution', dt, 'caution');
    bf('sp-size', dt.specs, 'size'); bf('sp-material', dt.specs, 'material'); bf('sp-power', dt.specs, 'power');
    bf('sp-contents', dt.specs, 'contents'); bf('sp-cert', dt.specs, 'cert');

    $('#heroThumb').addEventListener('click', function () { $('#heroFile').click(); });
    $('#heroFile').addEventListener('change', function () {
      if (!this.files[0]) return;
      GF_UI.readImage(this.files[0], 1100, function (u) { dt.heroImg = u; GF_STORE.save(); $('#heroThumb').innerHTML = '<img src="' + u + '">'; GF_UI.toast('메인 컷 적용'); });
      this.value = '';
    });
    $('#heroClear').addEventListener('click', function () { dt.heroImg = ''; GF_STORE.save(); $('#heroThumb').innerHTML = '클릭해서<br>이미지 선택'; });
    $('#btnAddCut').addEventListener('click', function () { dt.cuts.push({ img: '', label: '', caption: '' }); GF_STORE.save(); renderCuts(); });
  }

  function renderCuts() {
    var dt = GF_STORE.state.project.detail;
    var box = $('#cutList'); if (!box) return;
    box.innerHTML = dt.cuts.map(function (c, i) {
      return '<div class="cut-row"><div class="cut-thumb" data-cutthumb="' + i + '">' + (c.img ? '<img src="' + c.img + '">' : '클릭해서<br>이미지 선택') + '</div>'
        + '<div class="cut-fields"><input type="text" data-cutlabel="' + i + '" value="' + esc(c.label) + '" placeholder="컷 제목 (예: 마퀴 점등 디테일)">'
        + '<input type="text" data-cutcap="' + i + '" value="' + esc(c.caption) + '" placeholder="캡션 (선택)"></div>'
        + '<button class="btn btn-xs btn-ghost" data-cutdel="' + i + '">삭제</button>'
        + '<input type="file" data-cutfile="' + i + '" accept="image/*" class="hidden"></div>';
    }).join('');
    GF_UI.$all('[data-cutthumb]', box).forEach(function (th) { th.addEventListener('click', function () { GF_UI.$('[data-cutfile="' + th.getAttribute('data-cutthumb') + '"]', box).click(); }); });
    GF_UI.$all('[data-cutfile]', box).forEach(function (inp) {
      inp.addEventListener('change', function () {
        var i = Number(inp.getAttribute('data-cutfile')); if (!this.files[0]) return;
        GF_UI.readImage(this.files[0], 900, function (u) { dt.cuts[i].img = u; GF_STORE.save(); renderCuts(); GF_UI.toast('컷 이미지 적용'); });
      });
    });
    GF_UI.$all('[data-cutlabel]', box).forEach(function (inp) { inp.addEventListener('input', function () { dt.cuts[Number(inp.getAttribute('data-cutlabel'))].label = this.value; GF_STORE.save(); }); });
    GF_UI.$all('[data-cutcap]', box).forEach(function (inp) { inp.addEventListener('input', function () { dt.cuts[Number(inp.getAttribute('data-cutcap'))].caption = this.value; GF_STORE.save(); }); });
    GF_UI.$all('[data-cutdel]', box).forEach(function (btn) { btn.addEventListener('click', function () { dt.cuts.splice(Number(btn.getAttribute('data-cutdel')), 1); GF_STORE.save(); renderCuts(); }); });
  }

  function renderFeatures() {
    var dt = GF_STORE.state.project.detail;
    while (dt.features.length < 5) dt.features.push('');
    var box = $('#featList'); if (!box) return;
    box.innerHTML = dt.features.slice(0, 5).map(function (f, i) {
      return '<div class="field" style="margin-bottom:8px"><input type="text" data-feat="' + i + '" value="' + esc(f) + '" placeholder="' + (i + 1) + '. 예: 버튼을 누르면 LED 마퀴 점등"></div>';
    }).join('');
    GF_UI.$all('[data-feat]', box).forEach(function (inp) { inp.addEventListener('input', function () { dt.features[Number(inp.getAttribute('data-feat'))] = this.value; GF_STORE.save(); }); });
  }

  return { render: render };
})();
