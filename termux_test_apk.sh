#!/data/data/com.termux/files/usr/bin/bash
# Jenga APK ya release iliyosainiwa kwa kujaribu kwenye simu: bash termux_test_apk.sh
set -e
cd "$(dirname "$0")"
unset JAVA_HOME
export JAVA_HOME="$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/android-sdk"
"$HOME/gradle-8.11.1/bin/gradle" assembleRelease --no-daemon
mkdir -p "$HOME/storage/downloads" 2>/dev/null || true
cp app/build/outputs/apk/release/app-release.apk "$HOME/storage/downloads/MJUE_YESU_release.apk"
echo "APK: Downloads/MJUE_YESU_release.apk"
