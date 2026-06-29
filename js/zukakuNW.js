/**
 * 図郭コードの文字列長から地図情報レベルを判定する
 * - 6桁: 5000
 * - 7桁: 2500
 * - 8桁: 末尾が英字なら 1000、数字なら 500 (ただし useLegacyLv1250=true の場合は 1250)
 * 元実装: judgelevel(word, use_legacy_lv1250=False) を移植 【1-b55b84】
 */
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

/**
 * 図郭番号から北西座標を取得する（NW = North-West）
 * 元実装: getZukakuNW(w: str, use_legacy_lv1250=False) を移植 【1-b55b84】
 *
 * @param {string} w 図郭番号 (例: '08ne2332')
 * @param {boolean} useLegacyLv1250 旧四次区画(1250)の判定・分割を使う場合 true
 * @returns {object} {level, no19, xNW, yNW, dx, dy} または {level}（エラー時）
 */
function getZukakuNW(w, useLegacyLv1250 = false) {
  /**
   * 元実装の _getcoords(word, xorg, yorg, dx, dy) を移植 【1-b55b84】
   * @returns {[number|null, number|null]} [xc, yc]
   */
  function _getCoords(word, xorg, yorg, dx, dy) {
    let v = String(word);

    let iy, ix;

    // 地図情報レベル 50000、5000、1000、500に対応（2文字）
    if (v.length === 2) {
      const getInd = (vv) => {
        if (/^\d+$/.test(vv)) {
          return parseInt(vv, 10);
        } else {
          const code = vv.charCodeAt(0);
          if (vv >= "A" && vv <= "Z") return code - "A".charCodeAt(0);
          if (vv >= "a" && vv <= "z") return code - "a".charCodeAt(0);
          return NaN;
        }
      };

      iy = getInd(v[0]);
      ix = getInd(v[1]);
      if (!Number.isFinite(iy) || !Number.isFinite(ix)) return [null, null];

    // 地図情報レベル 2500、1250に対応（1文字, 1〜4の4分割）
    } else if (v.length === 1) {
      const q = parseInt(v, 10);
      if (q === 1) {
        iy = 0; ix = 0;
      } else if (q === 2) {
        iy = 0; ix = 1;
      } else if (q === 3) {
        iy = 1; ix = 0;
      } else if (q === 4) {
        iy = 1; ix = 1;
      } else {
        return [null, null];
      }
    } else {
      return [null, null];
    }

    const yc = yorg - iy * dy;
    const xc = xorg + ix * dx;
    return [xc, yc];
  }

  const level = judgeLevel(w, useLegacyLv1250);
  // Pythonと同様、判定できない場合は level だけ返す 【1-b55b84】
  if (level === "error") return { level };

  const no19 = parseInt(w.slice(0, 2), 10);
  if (!Number.isFinite(no19)) return { level };

  // 図郭の北西座標を求める
  // 地図情報レベル 50000
  let dx = 40000;
  let dy = 30000;

  let xc, yc;

  // 50000レベルの2文字分割（w[2:4]）
  [xc, yc] = _getCoords(w.slice(2, 4), -160000, 300000, dx, dy);

  // 地図情報レベル 5000（さらに10分割, w[4:6]）
  dx /= 10;
  dy /= 10;
  [xc, yc] = _getCoords(w.slice(4, 6), xc, yc, dx, dy);

  if (level === "5000") {
    // ここで確定
  } else if (level === "1000") {
    // 地図情報レベル 1000（さらに5分割, w[6:8]）
    dx /= 5;
    dy /= 5;
    [xc, yc] = _getCoords(w.slice(6, 8), xc, yc, dx, dy);

  } else if (level === "500") {
    // 地図情報レベル 500（さらに10分割, w[6:8]）
    dx /= 10;
    dy /= 10;
    [xc, yc] = _getCoords(w.slice(6, 8), xc, yc, dx, dy);

  } else if (level === "2500") {
    // 地図情報レベル 2500（5000を4分割, w[6:7]）
    dx /= 2;
    dy /= 2;
    [xc, yc] = _getCoords(w.slice(6, 7), xc, yc, dx, dy);

  } else if (level === "1250") {
    // 地図情報レベル 1250
    // 5000を4分割 (w[6:7])
    dx /= 2;
    dy /= 2;
    [xc, yc] = _getCoords(w.slice(6, 7), xc, yc, dx, dy);

    if (xc === null) return { level };

    // 2500を4分割 (w[7:8])
    dx /= 2;
    dy /= 2;
    [xc, yc] = _getCoords(w.slice(7, 8), xc, yc, dx, dy);

  } else {
    return { level };
  }

  if (xc === null || yc === null) return { level };

  return { level, no19, xNW: xc, yNW: yc, dx, dy };
}

// Node.js (CommonJS) 用のエクスポート例
// module.exports = { judgeLevel, getZukakuNW };

// ES Modules 用のエクスポート例（必要なら）
// export { judgeLevel, getZukakuNW };
