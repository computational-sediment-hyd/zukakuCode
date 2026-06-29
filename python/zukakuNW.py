

__version__ = '0.1.0'




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
