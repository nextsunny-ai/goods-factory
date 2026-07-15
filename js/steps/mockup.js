/* ============ 5단계: 굿즈 목업 (디자인을 제품에 얹어보기) ============ */
var GF_MOCKUP = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  function render(root) {
    var proj = GF_STORE.state.project;
    proj.mockups = proj.mockups || {};

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 5</span>'
      + '  <h1>굿즈 목업</h1>'
      + '  <p>디자인 이미지를 올리면 여러 제품에 얹은 모습을 한눈에 미리 봅니다. "이 그림을 키링에? 티셔츠에?" 이것저것 상상해볼 때 쓰세요. (실제 인쇄 결과가 아닌 배치 미리보기입니다)</p>'
      + '</div>'

      + '<div class="card">'
      + '  <div class="card-head" style="margin-bottom:14px">'
      + '    <div><h3 style="margin:0">디자인 이미지</h3><p style="font-size:12.5px;color:var(--ink-2);margin:2px 0 0">4단계에서 생성한 시안이나, 가진 로고·아트웍을 올리세요.</p></div>'
      + '    <div style="display:flex;gap:8px">'
      + '      <button class="btn btn-sm btn-primary" id="mkUpload">이미지 올리기</button>'
      + (proj.refs && proj.refs.length ? '<button class="btn btn-sm btn-ghost" id="mkFromRef">레퍼런스에서 가져오기</button>' : '')
      + (proj.mockups.current ? '<button class="btn btn-sm btn-ghost" id="mkClear">비우기</button>' : '')
      + '    </div>'
      + '  </div>'
      + '  <input type="file" id="mkFile" accept="image/*" class="hidden">'
      + '  <div id="mkCurrent"></div>'
      + '</div>'

      + '<div class="card">'
      + '  <h3>제품 미리보기</h3>'
      + '  <p class="desc">각 제품 카드의 "PNG 저장"으로 목업 이미지를 내려받아 기획안·제안서에 붙일 수 있습니다.</p>'
      + '  <div class="mock-grid" id="mockGrid"></div>'
      + '</div>'

      + '<div class="step-footer">'
      + '  <button class="btn btn-ghost" id="mkPrev">← 디자인·프롬프트</button>'
      + '  <button class="btn btn-primary" id="mkNext">다음 → 스케줄</button>'
      + '</div>';

    root.innerHTML = html;
    renderCurrent();
    renderGrid();

    $('#mkUpload').addEventListener('click', function () { $('#mkFile').click(); });
    $('#mkFile').addEventListener('change', function () {
      if (!this.files[0]) return;
      GF_UI.readImage(this.files[0], 800, function (dataUrl) {
        proj.mockups.current = dataUrl; GF_STORE.save();
        renderCurrent(); renderGrid();
        GF_UI.toast('디자인을 제품에 얹었습니다');
      });
      this.value = '';
    });
    var fromRef = $('#mkFromRef');
    if (fromRef) fromRef.addEventListener('click', function () {
      var designRef = (proj.refs || []).filter(function (r) { return r.kind === 'design'; });
      var pool = designRef.length ? designRef : proj.refs;
      if (!pool.length) { GF_UI.toast('레퍼런스가 없습니다'); return; }
      proj.mockups.current = pool[0].img; GF_STORE.save();
      renderCurrent(); renderGrid();
      GF_UI.toast('레퍼런스 이미지를 목업에 적용했습니다');
    });
    var clr = $('#mkClear');
    if (clr) clr.addEventListener('click', function () {
      proj.mockups.current = ''; GF_STORE.save(); render(root);
    });

    $('#mkPrev').addEventListener('click', function () { GF_APP.go(4); });
    $('#mkNext').addEventListener('click', function () { GF_APP.go(6); });
  }

  function renderCurrent() {
    var box = $('#mkCurrent');
    var cur = GF_STORE.state.project.mockups.current;
    if (!cur) {
      box.innerHTML = '<div style="border:1px dashed var(--line-2);border-radius:var(--r);padding:26px;text-align:center;color:var(--ink-3);font-size:13px">아직 올린 디자인이 없습니다. 이미지를 올리면 아래 제품들에 자동으로 얹힙니다.</div>';
      return;
    }
    box.innerHTML = '<div style="display:flex;align-items:center;gap:14px">'
      + '<img src="' + cur + '" style="width:110px;height:110px;object-fit:contain;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2)">'
      + '<span style="font-size:12.5px;color:var(--ink-2)">이 디자인이 아래 모든 제품에 적용됩니다. 다른 이미지로 바꾸려면 다시 "이미지 올리기".</span></div>';
  }

  function renderGrid() {
    var grid = $('#mockGrid');
    var design = GF_STORE.state.project.mockups.current || null;
    grid.innerHTML = GF_MOCKUPS.map(function (m) {
      return '<div class="mock-card">'
        + '<div class="mock-stage" id="stage-' + m.id + '">' + m.render(design) + '</div>'
        + '<div class="mock-cap"><span class="m-name">' + esc(m.name) + '</span>'
        + '<button class="btn btn-xs btn-ghost" data-mkpng="' + m.id + '"' + (design ? '' : ' disabled') + '>PNG 저장</button></div>'
        + '</div>';
    }).join('');

    GF_UI.$all('[data-mkpng]', grid).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-mkpng');
        var m = GF_MOCKUPS.filter(function (x) { return x.id === id; })[0];
        toPng(m.render(design), id);
      });
    });
  }

  /* SVG 문자열 → PNG 다운로드 */
  function toPng(svgStr, id) {
    var proj = GF_STORE.state.project;
    var img = new Image();
    var svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = 800; cv.height = 800;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 800, 800);
      ctx.drawImage(img, 0, 0, 800, 800);
      cv.toBlob(function (blob) {
        var name = '목업_' + id + '_' + (proj.plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '.png';
        GF_UI.download(name, blob);
        GF_UI.toast('목업 PNG를 저장했습니다');
      }, 'image/png');
    };
    img.onerror = function () { GF_UI.toast('목업 저장 실패 — 다른 디자인 이미지로 시도해주세요'); };
    img.src = svg64;
  }

  return { render: render };
})();
