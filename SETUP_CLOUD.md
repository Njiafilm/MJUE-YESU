# MJUE YESU — Kuwasha Cloud (admin ahariri, watumiaji wote wapate)

Toleo hili (3.0) lina **usimamizi wa cloud**. Admin akibadilisha kitu (Biblia, nyimbo, nembo, maandishi, Neno la Leo, lesoni), **watumiaji wote wanakipata** wanapofungua app (au ndani ya dakika 5 ikiwa wameifungua). Maudhui huhifadhiwa kwenye simu, kwa hiyo app bado inafanya kazi **offline**.

Cloud inatumia **Firebase (Firestore)** — bure kwa matumizi ya kawaida (Spark plan, **haihitaji kadi ya benki**). Fanya hatua hizi **mara moja tu**:

## 1. Tengeneza Firebase project
1. Fungua https://console.firebase.google.com → **Add project** → jina mf. `mjue-yesu` → endelea (Analytics si lazima).
2. Kushoto: **Build → Firestore Database → Create database** → chagua eneo karibu nawe (mf. `europe-west1`) → **Production mode** → Create.
3. Kushoto: **Build → Authentication → Get started** → tabo **Sign-in method**:
   - washa **Email/Password**
   - washa **Anonymous** (kwa ajili ya Gumzo la watumiaji)
4. Tabo **Users → Add user** → weka **barua pepe na nenosiri la admin** (hii ndiyo utaingia nayo kwenye app). Nenosiri liwe gumu.

## 2. Weka sheria za usalama
1. Firestore → tabo **Rules**.
2. Futa kilichopo, bandika yaliyomo ya `firebase/firestore.rules`.
3. **Badilisha** `admin@example.com` kuwa barua pepe ya admin uliyotengeneza hatua 1.4. → **Publish**.

> Hii ndiyo inayozuia mtu mwingine kubadilisha maudhui: kila mtu anasoma, **admin pekee** anaandika.

## 3. Weka funguo kwenye app
1. Firebase → ⚙ **Project settings → General** → nakili **Project ID** na **Web API Key**.
2. Fungua `app/src/main/assets/www/cloud-config.js` na ujaze:
   ```js
   window.MJUE_CLOUD_CONFIG = { apiKey: "AIza....", projectId: "mjue-yesu" };
   ```
   (Web API Key si siri — inaruhusiwa kuwa ndani ya app; usalama uko kwenye sheria za hatua 2.)
3. Jenga APK upya (Android Studio / `termux_build.sh` / GitHub Actions) na usambaze **toleo la 3.0** kwa watumiaji **mara moja**. Baada ya hapo, mabadiliko yote ya admin hayahitaji APK mpya.

## 4. Kutumia (admin)
Nyumbani bofya kigae **FANYA SASISHO** → ingia kwa barua pepe/nenosiri la admin. Kisha:

| Kichupo | Unaweza |
|---|---|
| 📖 **Biblia** | Kuongeza toleo jipya (JSON / CSV / TSV / `kjv_sw.js`), kubadilisha toleo lililopo, kufuta toleo la cloud, na **kuhariri aya moja moja** (hata za NENO/ULB/KJV) |
| 🎵 **Nyimbo** | Kuongeza/kuhariri/kufuta wimbo (namba, jina, maneno), kuweka **sauti** (mp3/m4a ≤ 4 MB) |
| 🖼 **Nembo** | Kubadilisha nembo (upau wa juu + ukurasa wa nyumbani) |
| ✏️ **Maandishi** | Kuhariri vichwa/maelezo ya app moja kwa moja kwenye skrini; **Neno la Leo** (la kawaida au la tarehe maalum) |
| ⚙ **Hali** | Kusasisha sasa, lesoni (picha/PDF), kufungua gumzo, kutoka |

- **Lesoni:** fungua somo → bofya ✏️ (juu) kuhariri maandishi → **Hifadhi** (inatumwa kwa wote). Picha/PDF/maelezo ya ziada: kitufe cha "Fungua usimamizi wa Lesoni".
- **Gumzo la watumiaji:** kigae **GUMZO LA WATUMIAJI**. Admin anaona 🗑 kufuta ujumbe wowote.
- Menyu ya zamani **⚙ Settings / Admin** pia inatumia barua pepe/nenosiri la Firebase (nenosiri la zamani lililokuwa ndani ya msimbo halitumiki tena).

### Muundo wa faili la Biblia
- **CSV/TSV** (safu 4, bila kichwa): `GEN,1,1,"Hapo mwanzo Mungu aliumba mbingu na dunia."` — code ni za herufi 3 (GEN, EXO, … PSA, MAT, JHN, 1CO, REV).
- **JSON:** `{"GEN":{"1":{"1":"…","2":"…"}}, "EXO":{…}}`
- Vitabu 66, hadi ~14 MB. Watumiaji wanapakua toleo mara moja, kisha linakaa offline.

## Mambo ya kujua
- **Aikoni ya app kwenye skrini ya simu** na jina la app chini ya aikoni haviwezi kubadilishwa kwa mbali (Android hairuhusu) — hivyo vinahitaji APK mpya. Nembo ndani ya app inabadilika kwa cloud.
- Mtumiaji asiye na mtandao anaona maudhui ya mwisho aliyopakua; yatasasishwa akipata mtandao.
- Kikomo cha bure cha Firebase (~50,000 usomaji/siku) kinatosha makundi ya kawaida: kila ufunguzi wa app ni usomaji 1 (au kidogo zaidi pale kuna mabadiliko mapya).
- Mtu yeyote anaweza **kusoma** maudhui ya cloud (ni maudhui ya umma ya app); hawezi kuandika.
- Ukipoteza nenosiri la admin: Firebase → Authentication → Users → Reset password.
