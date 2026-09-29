#!/data/data/com.termux/files/usr/bin/bash
# MJUE YESU — jenga APK ndani ya Termux. Endesha: bash termux_build.sh
# Inatumia Gradle 8.11.1 na SDK ya ~/android-sdk; vitu vilivyopo havipakuliwi tena.
set -e
cd "$(dirname "$0")"
PROJ="$(pwd)"
GRADLE_VER=8.11.1

command -v java >/dev/null || pkg install -y openjdk-17 || pkg install -y openjdk-21
command -v aapt2 >/dev/null || pkg install -y aapt2 || echo "ONYO: aapt2 haikupatikana"
command -v unzip >/dev/null || pkg install -y unzip wget

export JAVA_HOME="$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/android-sdk"

if [ ! -x "$HOME/gradle-$GRADLE_VER/bin/gradle" ]; then
  echo "==> Gradle $GRADLE_VER"
  cd "$HOME"
  wget -q --show-progress -O gradle.zip "https://services.gradle.org/distributions/gradle-$GRADLE_VER-bin.zip"
  unzip -q gradle.zip && rm gradle.zip
  cd "$PROJ"
fi

if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
  echo "==> Android SDK"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  cd "$HOME"
  wget -q --show-progress -O cmd.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q cmd.zip -d "$ANDROID_HOME/cmdline-tools" && rm cmd.zip
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  cd "$PROJ"
fi
if [ ! -d "$ANDROID_HOME/platforms/android-34" ] || [ ! -d "$ANDROID_HOME/build-tools/34.0.0" ]; then
  yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null || true
  "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;34.0.0"
fi

echo "sdk.dir=$ANDROID_HOME" > local.properties
grep -q aapt2FromMavenOverride gradle.properties || echo "android.aapt2FromMavenOverride=$PREFIX/bin/aapt2" >> gradle.properties

echo "==> Kujenga APK (dakika 5-15)"
"$HOME/gradle-$GRADLE_VER/bin/gradle" assembleDebug --no-daemon

mkdir -p "$HOME/storage/downloads" 2>/dev/null || true
cp app/build/outputs/apk/debug/app-debug.apk "$HOME/storage/downloads/MJUE_YESU.apk" \
  && echo "IMEKAMILIKA: Downloads/MJUE_YESU.apk" \
  || echo "APK: $PROJ/app/build/outputs/apk/debug/app-debug.apk"
