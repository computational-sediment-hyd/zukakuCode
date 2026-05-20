// api/zukaku.js

function judgeLevel(word, useLegacyLv1250 = false) {
  if (typeof word !== "string") return "error";

  if (word.length === 6) {
    return "5000";
  } else if (word.length === 7) {
    return "2500";
  } else if (word.length === 8) {
    const last = word[word.length - 1];
    if (/[A-Za-z]/.test(last)) {
      return "1000";
    } else {
      return useLegacyLv1250 ? "1250" : "500";
    }
  } else {
    return "error";
  }
}

function getZukakuNW(w, useLegacyLv1250 = false) {
  function _getCoords(word, xorg, yorg, dx, dy) {
    let v = String(word);
    let iy, ix;

    // 2文字：50000/5000/1000/500系（数字or英字のインデックス）
    if (v.length === 2) {
      const getInd = (vv) => {
        if (/^\d+$/.test(vv)) return parseInt(vv, 10);
        const code = vv.charCodeAt(0);
        if (vv >= "A" && vv <= "Z") return code - "A".charCodeAt(0);
        if (vv >= "a" && vv <= "z") return code - "a".charCodeAt(0);
        return NaN;
      };

      iy = getInd(v[0]);
      ix = getInd(v[1]);
      if (!Number.isFinite(iy) || !Number.isFinite(ix)) return [null, null];

    // 1文字：2500/1250系（1〜4の4分割）
    } else if (v.length === 1) {
      const q = parseInt(v, 10);
      if (q === 1) { iy = 0; ix = 0; }
      else if (q === 2) { iy = 0; ix = 1; }
      else if (q === 3) { iy = 1; ix = 0; }
      else if (q === 4) { iy = 1; ix = 1; }
      else return [null, null];
    } else {
      return [null, null];
    }

    const yc = yorg - iy * dy;
    const xc = xorg + ix * dx;
    return [xc, yc];
  }

  const level = judgeLevel(w, useLegacyLv1250);
  if (level === "error") return { level };

  const no19 = parseInt(String(w).slice(0, 2), 10);
  if (!Number.isFinite(no19)) return { level };

  // 50000
  let dx = 40000;
  let dy = 30000;

  let xc, yc;

  // w[2:4]
  [xc, yc] = _getCoords(String(w).slice(2, 4), -160000, 300000, dx, dy);

  // 5000 (10分割) w[4:6]
  dx /= 10;
  dy /= 10;
  [xc, yc] = _getCoords(String(w).slice(4, 6), xc, yc, dx, dy);

  if (level === "5000") {
    // ok
  } else if (level === "1000") {
    // (5分割) w[6:8]
    dx /= 5;
    dy /= 5;
    [xc, yc] = _getCoords(String(w).slice(6, 8), xc, yc, dx, dy);

  } else if (level === "500") {
    // (10分割) w[6:8]
    dx /= 10;
    dy /= 10;
    [xc, yc] = _getCoords(String(w).slice(6, 8), xc, yc, dx, dy);

  } else if (level === "2500") {
    // (4分割) w[6:7]
    dx /= 2;
    dy /= 2;
    [xc, yc] = _getCoords(String(w).slice(6, 7), xc, yc, dx, dy);

  } else if (level === "1250") {
    // (まず5000を4分割) w[6:7]
    dx /= 2;
    dy /= 2;
    [xc, yc] = _getCoords(String(w).slice(6, 7), xc, yc, dx, dy);

    if (xc === null) return { level };

    // (次に2500を4分割) w[7:8]
    dx /= 2;
    dy /= 2;
    [xc, yc] = _getCoords(String(w).slice(7, 8), xc, yc, dx, dy);

  } else {
    return { level };
  }

  if (xc === null || yc === null) return { level };

  return { level, no19, xNW: xc, yNW: yc, dx, dy };
}

export { judgeLevel, getZukakuNW };
``