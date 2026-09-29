#!/data/data/com.termux/files/usr/bin/bash
# MJUE YESU — tengeneza AAB ya RELEASE (Google Play) ndani ya Termux. Endesha: bash termux_release.sh
set -e
cd "$(dirname "$0")"
PROJ="$(pwd)"
GRADLE_VER=8.11.1

echo "==> 1/6 Vifurushi"
pkg install -y wget unzip aapt2 || true
pkg install -y openjdk-21 || true
unset JAVA_HOME
export JAVA_HOME="$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/android-sdk"
java -version 2>&1 | head -1

echo "==> 2/6 Gradle $GRADLE_VER"
if [ ! -x "$HOME/gradle-$GRADLE_VER/bin/gradle" ]; then
  cd "$HOME"
  wget -c -q --show-progress -O gradle.zip "https://services.gradle.org/distributions/gradle-$GRADLE_VER-bin.zip"
  unzip -q gradle.zip && rm gradle.zip
  cd "$PROJ"
fi

echo "==> 3/6 Android SDK"
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null || true
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;36.0.0"
echo "sdk.dir=$ANDROID_HOME" > local.properties
grep -q aapt2FromMavenOverride gradle.properties || echo "android.aapt2FromMavenOverride=$PREFIX/bin/aapt2" >> gradle.properties

echo "==> 4/6 Ufunguo wa kusaini (keystore)"
if [ ! -f keystore.properties ]; then
  echo "Tengeneza nenosiri LA KUDUMU (herufi 8+). USILIPOTEZE."
  while true; do
    read -s -p "Nenosiri: " KP; echo
    read -s -p "Rudia nenosiri: " KP2; echo
    [ "$KP" = "$KP2" ] && [ ${#KP} -ge 8 ] && break
    echo "Hayalingani au ni fupi. Jaribu tena."
  done
  keytool -genkeypair -v -keystore mjueyesu-release.jks -alias mjueyesu \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$KP" -keypass "$KP" \
    -dname "CN=MJUE YESU, OU=Mobile, O=MJUE YESU, C=TZ"
  cat > keystore.properties <<PROPS
storeFile=mjueyesu-release.jks
storePassword=$KP
keyAlias=mjueyesu
keyPassword=$KP
PROPS
  mkdir -p "$HOME/storage/downloads" 2>/dev/null || true
  cp mjueyesu-release.jks "$HOME/storage/downloads/MJUE_YESU_KEYSTORE_BACKUP.jks" 2>/dev/null && \
    echo ">>> Nakala ya ufunguo: Downloads/MJUE_YESU_KEYSTORE_BACKUP.jks (ihifadhi mahali salama!)"
fi

echo "==> 5/6 Kujenga AAB (dakika 5-20)"
"$HOME/gradle-$GRADLE_VER/bin/gradle" bundleRelease --no-daemon

echo "==> 6/6 Kunakili AAB"
AAB="$PROJ/app/build/outputs/bundle/release/app-release.aab"
mkdir -p "$HOME/storage/downloads" 2>/dev/null || true
cp "$AAB" "$HOME/storage/downloads/MJUE_YESU.aab" 2>/dev/null && echo "AAB: Downloads/MJUE_YESU.aab" || echo "AAB: $AAB"
