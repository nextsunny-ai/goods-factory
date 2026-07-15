/* ============================================================
   굿즈 목업 템플릿 (v1.2)
   - 사용자가 올린 디자인 이미지를 제품 실루엣의 인쇄 영역에 얹어 미리보기
   - SVG 기반. 디자인 없으면 인쇄 영역에 점선 자리표시
   - render(design) → SVG 문자열 (design = dataURL 또는 null)
   ============================================================ */
(function () {

  /* 인쇄 영역 슬롯: 디자인 있으면 clip된 이미지, 없으면 점선 자리표시 */
  function slot(clipId, shapeSvg, design, phLabel) {
    if (design) {
      return '<defs><clipPath id="' + clipId + '">' + shapeSvg + '</clipPath></defs>'
        + '<g clip-path="url(#' + clipId + ')"><image href="' + design + '" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice"/></g>';
    }
    return '<g opacity=".5">' + shapeSvg.replace(/fill="[^"]*"/g, 'fill="none"')
      + '</g>';
  }
  function ph(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="none" stroke="#C9C3B8" stroke-width="2" stroke-dasharray="6 6"/>'
      + '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 4) + '" text-anchor="middle" font-size="13" fill="#B4AFA5" font-family="Pretendard,sans-serif">디자인 영역</text>';
  }

  var C = '#DED9CF', INK = '#3A362E';

  var MOCKS = [
    { id: 'tshirt', name: '티셔츠', render: function (d) {
      var chest = '<rect x="150" y="150" width="100" height="120" rx="4" fill="#fff"/>';
      return svg(
        '<path d="M120 90 L160 70 Q200 96 240 70 L280 90 L320 130 L300 165 L272 150 L272 340 Q200 352 128 340 L128 150 L100 165 L80 130 Z" fill="#EDEBE6" stroke="' + C + '" stroke-width="2"/>'
        + (d ? slot('cl-ts', chest, d) : ph(150, 150, 100, 120))); } },

    { id: 'tote', name: '에코백', render: function (d) {
      var area = '<rect x="128" y="150" width="144" height="150" rx="4" fill="#fff"/>';
      return svg(
        '<path d="M150 110 Q150 70 175 70 Q175 100 175 110" fill="none" stroke="' + C + '" stroke-width="8"/>'
        + '<path d="M250 110 Q250 70 225 70 Q225 100 225 110" fill="none" stroke="' + C + '" stroke-width="8"/>'
        + '<rect x="110" y="110" width="180" height="230" rx="8" fill="#F0EEE9" stroke="' + C + '" stroke-width="2"/>'
        + (d ? slot('cl-to', area, d) : ph(128, 150, 144, 150))); } },

    { id: 'mug', name: '머그컵', render: function (d) {
      var area = '<rect x="150" y="150" width="110" height="110" rx="6" fill="#fff"/>';
      return svg(
        '<rect x="120" y="140" width="160" height="130" rx="16" fill="#F4F2EE" stroke="' + C + '" stroke-width="2"/>'
        + '<path d="M280 165 Q330 165 330 205 Q330 245 280 245" fill="none" stroke="' + C + '" stroke-width="12"/>'
        + (d ? slot('cl-mg', area, d) : ph(150, 150, 110, 110))); } },

    { id: 'keyring', name: '아크릴 키링', render: function (d) {
      var area = '<rect x="140" y="150" width="120" height="150" rx="16" fill="#fff"/>';
      return svg(
        '<circle cx="200" cy="120" r="14" fill="none" stroke="' + C + '" stroke-width="6"/>'
        + '<rect x="132" y="142" width="136" height="166" rx="20" fill="#F0EEE9" stroke="' + C + '" stroke-width="2"/>'
        + (d ? slot('cl-kr', area, d) : ph(140, 150, 120, 150))
        + '<rect x="132" y="142" width="136" height="166" rx="20" fill="#fff" opacity=".08"/>'); } },

    { id: 'phonecase', name: '폰케이스', render: function (d) {
      var area = '<rect x="150" y="90" width="100" height="220" rx="20" fill="#fff"/>';
      return svg(
        '<rect x="146" y="86" width="108" height="228" rx="26" fill="#F0EEE9" stroke="' + C + '" stroke-width="2"/>'
        + (d ? slot('cl-pc', area, d) : ph(150, 96, 100, 208))
        + '<rect x="168" y="104" width="26" height="26" rx="8" fill="#E4E0D8"/>'); } },

    { id: 'poster', name: '포스터·액자', render: function (d) {
      var area = '<rect x="120" y="90" width="160" height="220" fill="#fff"/>';
      return svg(
        '<rect x="106" y="76" width="188" height="248" rx="4" fill="#EDEBE6" stroke="' + C + '" stroke-width="2"/>'
        + '<rect x="120" y="90" width="160" height="220" fill="#fff" stroke="' + C + '" stroke-width="1"/>'
        + (d ? slot('cl-po', area, d) : ph(120, 90, 160, 220))); } },

    { id: 'sticker', name: '다이컷 스티커', render: function (d) {
      var area = '<rect x="130" y="130" width="140" height="140" rx="18" fill="#fff"/>';
      return svg(
        '<rect x="122" y="122" width="156" height="156" rx="26" fill="#fff" stroke="' + C + '" stroke-width="3" stroke-dasharray="2 4"/>'
        + (d ? slot('cl-st', area, d) : ph(130, 130, 140, 140))); } },

    { id: 'acrylic-stand', name: '아크릴 스탠드', render: function (d) {
      var area = '<rect x="140" y="80" width="120" height="170" rx="10" fill="#fff"/>';
      return svg(
        '<ellipse cx="200" cy="330" rx="86" ry="16" fill="#EDEBE6" stroke="' + C + '" stroke-width="2"/>'
        + '<rect x="160" y="300" width="80" height="20" rx="4" fill="#F0EEE9" stroke="' + C + '" stroke-width="2"/>'
        + '<rect x="132" y="72" width="136" height="234" rx="16" fill="#F4F2EE" stroke="' + C + '" stroke-width="2"/>'
        + (d ? slot('cl-as', area, d) : ph(140, 84, 120, 210))); } }
  ];

  function svg(inner) {
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  window.GF_MOCKUPS = MOCKS;
})();
