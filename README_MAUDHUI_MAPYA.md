# Jinsi ya kusasisha maudhui bila kutengeneza APK mpya

Programu sasa inapakia ukurasa kutoka kwenye GitHub Pages:
https://njiafilm.github.io/MJUE-YESU/index.html

Ukiwa na mtandao, kila mtumiaji ataona mabadiliko papo hapo anapofungua
programu — HAHITAJI kusakinisha APK mpya. Bila mtandao, programu inarudi
kwenye nakala ya ndani (offline fallback) iliyowekwa wakati wa mwisho
kujenga APK.

## Hatua za kwanza (mara moja tu)
1. Kwenye github.com, fungua repo hii → Settings → Pages.
2. Chini ya "Branch", chagua `main` na folder `/docs`, kisha Save.
3. Subiri dakika 1-2. Ukurasa utapatikana kwenye:
   https://njiafilm.github.io/MJUE-YESU/index.html

## Kusasisha maudhui (kila mara baadaye)
```bash
cd ~/MJUE_YESU_Android
nano docs/index.html          # au badilisha faili lolote ndani ya docs/
git add -A
git commit -m "Sasisho la maudhui"
git push
```
Ndani ya dakika 1-2, GitHub Pages inasasisha yenyewe, na kila mtumiaji
mwenye mtandao ataona mabadiliko mara anapofungua programu.

## Ukibadilisha msimbo wa Java/Android (si maudhui tu)
Hilo BADO linahitaji APK/AAB mpya:
```bash
bash termux_test_apk.sh     # APK ya kujaribu kwenye simu
bash termux_release.sh      # AAB ya Google Play
```
Kumbuka pia kunakili mabadiliko yaleyale ndani ya `docs/index.html`
(nakala ya mtandaoni) ili zisitofautiane na `app/src/main/assets/www/index.html`
(nakala ya ndani/offline fallback).
