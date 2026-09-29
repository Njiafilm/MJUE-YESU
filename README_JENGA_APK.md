# MJUE YESU — Jenga APK (Java)

## Njia bora: Android Studio (PC)

1. Sakinisha Android Studio
2. Open project → chagua folda `MJUE_YESU_Android`
3. Subiri Gradle sync
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. APK: `app/build/outputs/apk/debug/app-debug.apk`

## Termux (simu) — ikiwa SDK tayari

```bash
cd ~/storage/downloads/MJUE_YESU_Android
export ANDROID_HOME=$HOME/android-sdk
export JAVA_HOME=$PREFIX/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
echo "sdk.dir=$HOME/android-sdk" > local.properties
gradle wrapper --gradle-version 8.2
chmod +x gradlew
# Ikiwa aapt2 inashindwa kwenye aarch64, jenga kwenye PC
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

## Yaliyomo
- Java WebView (hardware accelerated)
- Offline HTML: assets/www/index.html
- applicationId: com.mjueyesu.app

## Termux (rahisi zaidi)
```bash
termux-setup-storage
cd ~/storage/downloads/MJUE_YESU_Android
bash termux_build.sh
```
APK itakuwa: Downloads/MJUE_YESU.apk

## AAB ya Google Play (release, targetSdk 36)
```bash
cd ~/MJUE_YESU_Android
bash termux_release.sh
```
AAB: Downloads/MJUE_YESU.aab. Hifadhi mjueyesu-release.jks + nenosiri mahali salama.
