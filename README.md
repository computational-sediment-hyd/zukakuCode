# 図郭コードから地図情報レベルを自動判定して平面直角座標を取得するプログラム(Python版、API版、Webアプリ版あり)※地図情報レベル5000,2500,1000,500,1250に対応

---

  - [図郭コードとは](#図郭コードとは)
    - [■ 基本イメージ](#-基本イメージ)
    - [■ 定義](#-定義)
    - [■ 何のために使う？](#-何のために使う)
    - [■ コードの意味（例）](#-コードの意味例)
    - [■ メッシュコードとの違い](#-メッシュコードとの違い)
    - [■ まとめ](#-まとめ)
  - [国土基本図の図郭階層構造](#国土基本図の図郭階層構造)
    - [レベル50000（コード4桁）](#レベル50000コード4桁)
    - [レベル5000（コード6桁）](#レベル5000コード6桁)
    - [レベル2500（コード7桁）](#レベル2500コード7桁)
    - [レベル1250（コード8桁・末尾数字）★](#レベル1250コード8桁末尾数字)
    - [レベル1000（コード8桁・末尾英字）](#レベル1000コード8桁末尾英字)
    - [レベル500（コード8桁・末尾数字）](#レベル500コード8桁末尾数字)
    - [識別上の注意点](#識別上の注意点)
  - [コーディング](#コーディング)
    - [基本的な考え方　](#基本的な考え方)
    - [Python版](#python版)
    - [JavaScript版](#javascript版)
    - [API版](#api版)
    - [Webアプリ版](#webアプリ版)
  - [まとめ](#まとめ)
  - [GitHub](#github)


---

ALB測量等の面的測量の成果物は図郭コード単位でまとめられていることが多く、図郭コードから平面直角座標を取得することが必要になる場合があるため、図郭コードから地図情報レベルを自動判定して平面直角座標を取得するプログラムを作成しました。

図郭の示す場所を確認するのみであれば、https://gsj-seamless.jp/labs/tools/zukakuCode.html など良いサイトがいくつかありますので、
本記事は図郭情報をデータとして使用する方や実装する方に向けた内容となっています。


## 図郭コードとは
👉 地図を一定の区画（＝図郭）に分割したときに、**各区画の位置を識別するためのコード**です。

### ■ 基本イメージ

* 地図（国土基本図など）をタイル状に分割
* それぞれのタイルに「名前（ID）」を付ける
* その ID が **図郭コード**

👉 つまり「地図タイルの住所番号」のようなものです

### ■ 定義

* 図郭：地図を一定ルールで分割した区画
* 図郭コード：その区画を識別する英数字（通常4～8桁） [\[club.infor...atix.co.jp\]](https://club.informatix.co.jp/?p=1293)

### ■ 何のために使う？

主にGIS・測量・河川・インフラ業務で使われます。

例：

* 対象地域のデータを指定（例：この図郭だけ取得）
* 地図データのファイル名管理
* 公共測量・都市計画の範囲指定

### ■ コードの意味（例）

例えば

```
09LD35
```

構成：

* 09 → 平面直角座標系（地域ブロック）
* LD → 広域区画（約40km×30km）
* 35 → その中の細分区画 [\[club.infor...atix.co.jp\]](https://club.informatix.co.jp/?p=1293)

👉 この1つのコードで「どこか」を一意に特定できる

### ■ メッシュコードとの違い

よく混同されます：

| 項目   | 図郭コード   | メッシュコード |
| ---- | ------- | ------- |
| 基準   | 平面直角座標系 | 緯度・経度   |
| 主用途  | 測量・地図管理 | 統計・解析   |
| 管理主体 | 国土地理院   | 総務省など   |

👉 河川や測量系では**図郭コードの方が実務的**です

### ■ まとめ

* 図郭コード＝地図区画のID
* 地図データ管理の基本単位
* GIS・測量・河川分野で必須知識


## 国土基本図の図郭階層構造

国土基本図の図郭は、平面直角座標系を基準として上位レベルを段階的に分割することで構成される階層体系をとっている。最上位のレベル50000を起点として、下位のレベルへと入れ子状に細分化され、各図郭には位置を一意に識別する英数字の図郭コードが付与される。

<img src="https://computational-sediment-hyd.github.io/zukakuCode/fig/zukaku_1slide.png" width="100%">


### レベル50000（コード4桁）

最上位の区画で、1タイルの大きさは縦30km × 横40kmである。コードは「系番号2桁 + 区画位置アルファベット2桁」の4文字で表され、例えば `09LD` は第9系・L行D列の区画を意味する。隣接する区画はアルファベット1文字ずつ変化するため、`09LC`・`09LE`・`09KD`・`09MD` のように周囲の区画を特定することができる。この1区画を縦横それぞれ10分割することで、次のレベル5000の区画が生成される。

### レベル5000（コード6桁）

レベル50000の1区画を縦横各10分割した100区画から成る。1タイルは縦3km × 横4kmで、レベル50000の4桁コードに2桁の数字（00〜99）を追加した6桁コードで識別される。数字の割り当ては左上を00として行方向に増加する。例えば `09LD35` は上から4行目・左から6列目のタイルを指す。

### レベル2500（コード7桁）

レベル5000の1区画を縦横各2分割した4区画から成る。1タイルは縦1.5km × 横2kmで、6桁コードに1〜4の番号を追加した7桁コードで識別される。例えば `09LD352` はタイル `09LD35` の右上の区画にあたる。

### レベル1250（コード8桁・末尾数字）★

レベル2500のさらに縦横2分割による4区画から成る、旧図葉コードの「四次区画」に相当するレベルである。1タイルは縦750m × 横1kmで、7桁コードに1〜4の番号を追加した8桁コードで識別される。現行の作業規程の準則（付録7）には正式な区分として規定されておらず、自治体の点群データ等で独自に採用されている場合がある。

### レベル1000（コード8桁・末尾英字）

レベル5000の1区画を縦横各5分割した25区画から成る。1タイルは縦600m × 横800mで、6桁コードに英字1文字（A〜Y）を追加した8桁コードで識別される。末尾が必ずアルファベットになる点でレベル500・1250と区別できる。例えば `09LD354E` は上から4行目・左から5列目の区画を指す。

### レベル500（コード8桁・末尾数字）

レベル5000の1区画を縦横各10分割した100区画から成る。1タイルは縦300m × 横400mで、6桁コードに2桁の数字（00〜99）を追加した8桁コードで識別される。例えば `09LD3599` は下から1行目・右端の区画にあたる。

---

### 識別上の注意点

コード桁数とその末尾の形式を組み合わせることで、ファイル名から図郭レベルを判別できる。6桁はレベル5000、7桁はレベル2500にそれぞれ一対一対応する。8桁の場合、末尾が英字であればレベル1000に限定されるが、末尾が数字の場合はレベル500とレベル1250のどちらにも該当し得る。両者を区別するには、7桁目までのコードがレベル2500由来（7桁の有効コードと一致する）かレベル5000由来かを確認する必要がある。

## コーディング

### 基本的な考え方　
 - 入力した図郭コードから5000, 2500, 1000, 500, 1250の各レベルに対応するコード桁数と末尾形式を下のフローに基づいて判定する。
 - レベル1250（旧基準）は自動で判定できないため、オプションとしてユーザーが指定する必要がある。
 - 英文字の大文字・小文字はどちらでも判定可能とする。
 - 返り値は、レベル、平面直角座標番号、図郭の北西座標（X,Y）、図郭のサイズ（X,Y）の6つの情報とする。

<img src="https://computational-sediment-hyd.github.io/zukakuCode/fig/zukaku_map_levels_with_50000_5.jpg" width="100%">

### Python版

ファイルへのリンク：[zukakuNW.py](https://computational-sediment-hyd.github.io/zukakuCode/python/zukakuNW.py)

```python
import re

def judgelevel(word, use_legacy_lv1250=False):
    if len(word) == 6:
        return '5000'
    elif len(word) == 7:
        return '2500'
    elif len(word) == 8:
        if word[-1].isalpha():
            return '1000'
        else:
            if use_legacy_lv1250:
                return '1250'
            else:
                return '500'
    else:
        return "error"

def getZukakuNW(w: str, use_legacy_lv1250=False) -> dict:
    """
    図郭番号から北西座標を取得する
    図郭を参照 : https://club.informatix.co.jp/?p=1293

    Parameters:
    -----------
    w : str
        図郭番号 (例: '08ne2332')
    level : str|int
        地図情報レベル
        候補: 5000, 1000, 500, 2500, 1250, auto
    
    Returns:
    --------
    tuple
        (no19, xc, yc, dx, dy) - 図郭番号の最初の2桁、X座標、Y座標、X方向の幅、Y方向の幅
    """

    def _getcoords(word, xorg, yorg, dx, dy):
        v = str(word)

    # 地図情報レベル 50000、5000、1000、500に対応
        if len(v) == 2:
            def getInd(vv):
                if re.match(r'\d+', vv): # 数字の場合
                    return int(vv)
                else: # アルファベットの場合
                    return ord(vv) - ord('A') if vv.isupper() else ord(vv) - ord('a') # 大文字か小文字かで判定

            iy, ix = getInd(v[0]), getInd(v[1])

    # 地図情報レベル 2500、1250に対応　亜流も多いので注意 4分割
        elif len(v) == 1:
            v = int(word)

            if v == 1:
                iy, ix = 0, 0
            elif v == 2:
                iy, ix = 0, 1
            elif v == 3:
                iy, ix = 1, 0
            elif v == 4:
                iy, ix = 1, 1
            else:
                return None, None
        else:
            return None, None

        yc = yorg - iy*dy
        xc = xorg + ix*dx

        return xc, yc

    level = judgelevel(w, use_legacy_lv1250)

    no19 = int(w[:2])
    # 図郭の北西の座標を求める
    # 地図情報レベル 50000
    dx=int(40000)
    dy=int(30000)
    xc, yc = _getcoords(w[2:4], xorg=int(-160000), yorg=int(300000), dx=dx, dy=dy)

    # 地図情報レベル 5000
    dx/=int(10)
    dy/=int(10)
    xc, yc = _getcoords(w[4:6], xorg=xc, yorg=yc, dx=dx, dy=dy)

    if level == '5000':
        pass

    elif level == '1000': # 地図情報レベル 1000
        dx/=int(5)
        dy/=int(5)
        xc, yc = _getcoords(w[6:8], xorg=xc, yorg=yc, dx=dx, dy=dy)

    elif level == '500': # 地図情報レベル 500
        dx/=int(10)
        dy/=int(10)
        xc, yc = _getcoords(w[6:8], xorg=xc, yorg=yc, dx=dx, dy=dy)

    elif level == '2500': # 地図情報レベル 2500
    # 5000を4分割
        dx/=int(2)
        dy/=int(2)
        xc, yc = _getcoords(w[6:7], xorg=xc, yorg=yc, dx=dx, dy=dy)

    elif level == '1250': # 地図情報レベル 1250
    # 5000を4分割
        dx/=int(2)
        dy/=int(2)
        xc, yc = _getcoords(w[6:7], xorg=xc, yorg=yc, dx=dx, dy=dy)
        if xc is None: return {"level": level}

    # 2500を4分割
        dx/=int(2)
        dy/=int(2)
        xc, yc = _getcoords(w[7:8], xorg=xc, yorg=yc, dx=dx, dy=dy)

    else:
        return {"level": level}

    return {"level": level, "no19": no19, "xNW": xc, "yNW": yc, "dx": dx, "dy": dy}


r = getZukakuNW('08ne2332')
print(r)
# {'level': '500', 'no19': 8, 'xNW': 12800.0, 'yNW': -96900.0, 'dx': 400.0, 'dy': 300.0}
r = getZukakuNW('08ne2332', use_legacy_lv1250=True)
print(r)
# {'level': '1250', 'no19': 8, 'xNW': 13000.0, 'yNW': -97500.0, 'dx': 1000.0, 'dy': 750.0}


```




### JavaScript版

Python版をJavaScriptに移植したものです。以降に示すAPIやWebアプリで使用しています。

ファイルへのリンク：[zukakuNW.js](https://computational-sediment-hyd.github.io/zukakuCode/js/zukakuNW.js)

```javascript

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


```



### API版

JavaScript版をWeb APIとして公開しています。
`https://computational-sediment-hyd.github.io/zukakuCode/api/?w={図郭コード}&use_legacy_lv1250={0:1250を使わない(Default,省略可)、1：使う}`で取得できます。

 - https://computational-sediment-hyd.github.io/zukakuCode/api/?w=08ne2332 or https://computational-sediment-hyd.github.io/zukakuCode/api/?w=08ne2332&use_legacy_lv1250=0

 {
  "level": "500",
  "no19": 8,
  "xNW": 12800,
  "yNW": -96900,
  "dx": 400,
  "dy": 300
}

 - https://computational-sediment-hyd.github.io/zukakuCode/api/?w=08ne2332&use_legacy_lv1250=1

{
  "level": "1250",
  "no19": 8,
  "xNW": 13000,
  "yNW": -97500,
  "dx": 1000,
  "dy": 750
}

### Webアプリ版

JavaScript版をWebアプリとして公開しています。

https://computational-sediment-hyd.github.io/zukakuCode/app/zukaku.html

以下のようなインターフェイスで、図郭コードを入力すると、地図情報レベルと平面直角座標が表示され、csv形式でダウンロードすることもできます。

<img src="https://computational-sediment-hyd.github.io/zukakuCode/fig/appSS01.png" width="100%">

<img src="https://computational-sediment-hyd.github.io/zukakuCode/fig/appSS02.png" width="100%">


## まとめ

 - 図郭コードから座標を取得するプログラムとして、Python版、JavaScript版、API版、Webアプリ版を作ったので用途に応じて使っていただけると幸いです。

## GitHub

各種コードはGitHubで公開しています。

https://github.com/computational-sediment-hyd/zukakuCode
