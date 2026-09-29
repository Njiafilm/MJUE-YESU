#!/data/data/com.termux/files/usr/bin/bash
# MJUE YESU — jenga APK ndani ya Termux (arm64). Endesha: bash termux_build.sh
set -e
cd "$(dirname "$0")"
PROJ="$(pwd)"

echo "==> 1/6 Vifurushi"
pkg update -y
pkg install -y wget unzip
pkg install -y openjdk-17 || pkg install -y openjdk-21
pkg install -y aapt2 || echo "ONYO: aapt2 haikupatikana"

JDK_DIR="$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")"
export JAVA_HOME="${JDK_DIR%/}"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/android-sdk"

echo "==> 2/6 Gradle 8.6"
if [ ! -x "$HOME/gradle-8.6/bin/gradle" ]; then
  cd "$HOME"
  wget -q --show-progress -O gradle.zip https://services.gradle.org/distributions/gradle-8.6-bin.zip
  unzip -q gradle.zip && rm gradle.zip
  cd "$PROJ"
fi

echo "==> 3/6 Android SDK"
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  cd "$HOME"
  wget -q --show-progress -O cmd.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q cmd.zip -d "$ANDROID_HOME/cmdline-tools" && rm cmd.zip
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  cd "$PROJ"
fi
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null || true
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;34.0.0"

echo "==> 4/6 Mipangilio"
echo "sdk.dir=$ANDROID_HOME" > local.properties
grep -q aapt2FromMavenOverride gradle.properties || echo "android.aapt2FromMavenOverride=$PREFIX/bin/aapt2" >> gradle.properties

echo "==> 5/6 Kujenga APK (inaweza kuchukua dakika 5-15)"
"$HOME/gradle-8.6/bin/gradle" assembleDebug --no-daemon

echo "==> 6/6 Kunakili APK"
APK="$PROJ/app/build/outputs/apk/debug/app-debug.apk"
mkdir -p "$HOME/storage/downloads" 2>/dev/null || true
cp "$APK" "$HOME/storage/downloads/MJUE_YESU.apk" 2>/dev/null && echo "APK: Downloads/MJUE_YESU.apk" || echo "APK: $APK"
