# Standalone Windows (.exe) & Android (.apk) Build Pipeline

This update upgrades the GitHub Actions CI/CD pipeline and project configuration to compile actual, standalone **`CyberDrop.exe`** (Windows single-file WebView2 executable) and **`CyberDrop.apk`** (Android package compiled via Capacitor and Gradle) so you can download and run native applications on both platforms within the **10–20MB target size**, with complete instructions on how to install and execute them.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your selections, the compilation pipeline and native runtime targets are configured as follows:

- **Confirmed Windows Target**: Direct single-file executable **`CyberDrop.exe`** using native Windows WebView2 (~12MB). Requires zero external browser setups or Node.js runtimes on the user's PC—simply double-click to run.
- **Confirmed Android Target**: Standalone installable **`CyberDrop.apk`** compiled through Capacitor and Android Gradle (`assembleDebug`, ~10MB). Installs directly on any Android phone or tablet without Google Play or internet access.
- **Direct GitHub Artifacts & Releases**: GitHub Actions will output unzipped, standalone `CyberDrop.exe` and `CyberDrop.apk` directly into the Actions "Artifacts" panel and GitHub Release downloads.
- **In-App Installation & Running Guide**: A dedicated "Run on Windows & Android" guide modal added directly to the app showing download links, permissions setup, and PWA 1-click install alternatives.

***

## 1. Overview & Execution Workflow

### How the Files Are Generated & Run

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GITHUB ACTIONS CI/CD RUN                        │
│                                                                        │
│   ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│   │   Windows Matrix Job         │  │   Android Matrix Job         │   │
│   │   • Vite production build    │  │   • Java 17 + Android SDK    │   │
│   │   • Single-file WebView2 .exe│  │   • Capacitor sync           │   │
│   │   • Output: CyberDrop.exe    │  │   • ./gradlew assembleDebug  │   │
│   │     (~12 MB)                 │  │   • Output: CyberDrop.apk    │   │
│   │                              │  │     (~10 MB)                 │   │
│   └──────────────┬───────────────┘  └──────────────┬───────────────┘   │
│                  │                                 │                   │
│                  ▼                                 ▼                   │
│         [ CyberDrop.exe ]                 [ CyberDrop.apk ]            │
│         Double-click to run               Tap to install on Android    │
│         on Windows 10/11                  (Zero internet required)     │
└────────────────────────────────────────────────────────────────────────┘
```

1. **How to Run on Windows**:
   - Download **`CyberDrop.exe`** from the GitHub Actions Artifacts or Release.
   - Double-click `CyberDrop.exe`. It launches immediately in a sleek, hardware-accelerated dark cyber console window.
   - Discovers nearby devices via local Wi-Fi / hotspot and Web Bluetooth.

2. **How to Run on Android**:
   - Download **`CyberDrop.apk`** from GitHub Actions onto your Android device (or transfer it via USB/browser).
   - Tap the APK file to install (enable "Install unknown apps" if prompted).
   - Open CyberDrop from your app drawer. Runs 100% offline with zero data consumption.

***

## 2. Technical Architecture & File Changes

1. **Capacitor Android Configuration**:
   - Install `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`.
   - Add `capacitor.config.json` with app ID `com.cyberdrop.app` and webDir `dist`.
   - Scaffold the native Android Gradle project directory (`android/`).

2. **Windows Single-File WebView2 Executable Compiler**:
   - Include a lightweight Windows single-file packaging step in the workflow (`windows-latest` runner):
   - Compiles a native C#/C++ WebView2 wrapper or utilizes `pkg`/single-executable runner to bundle `dist/` into a single standalone `CyberDrop.exe` without heavy Electron dependencies.

3. **Multi-Job GitHub Actions Pipeline (`.github/workflows/build-and-release.yml`)**:
   - **Job 1 (Android Build)**: Runs on `ubuntu-latest`, sets up Java 17 + Android SDK, runs `npx cap sync android` and `./gradlew assembleDebug`, outputs `CyberDrop.apk`.
   - **Job 2 (Windows Build)**: Runs on `windows-latest`, compiles standalone `CyberDrop.exe`.
   - **Artifact Upload & Release**: Uploads both raw `.exe` and `.apk` binaries (not zipped) for 1-click downloading.

4. **In-App "How to Run" & Download Guide (`RunGuideModal.tsx`)**:
   - Adds an interactive modal and top-nav guide button with exact steps on how to find artifacts on GitHub, run `.exe` on Windows, and install `.apk` on Android.
