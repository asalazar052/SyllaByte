# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Android Studio](https://developer.android.com/studio) (Android Emulator)
- [Xcode](https://developer.apple.com/xcode/) (iOS Simulator, macOS only)

## Setup

1. Clone the repository.
2. Navigate to the mobile app directory:

   ```bash
   cd mobile
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start Expo:

   ```bash
   npx expo start
   ```

## Running the App

The app can run in **Expo Go**, including on a physical iPhone or Android phone.
The **embedded syllabus PDF viewer** is the exception: it uses native modules
that Expo Go does not include and requires a development build.

Once Expo starts:

- **iOS:** Press `i` to launch the iOS Simulator (requires Xcode).
- **Android:** Press `a` to launch the Android Emulator (requires Android Studio).

Make sure the emulator is configured and available.

## Running on a physical iPhone (Might remove section)

### Using Expo Go

1. Install **Expo Go** from the App Store.
2. Connect your iPhone and computer to the same Wi-Fi network.
3. From the repository root, start the app explicitly in Expo Go mode:

   ```bash
   cd mobile
   npm install
   npx expo start --go
   ```

4. Scan the terminal's QR code with the iPhone Camera app and open it in Expo Go.
5. If Expo requests a login, run `npx expo login` on your computer and sign in to
   Expo Go with the same account.

Leave the development server running while using the app. Source changes appear
through Fast Refresh. Xcode is not needed for this Expo Go workflow.

If your Wi-Fi blocks the connection, try `npx expo start --go --tunnel` and scan
the new QR code. A tunnel requires internet access and may prompt to install
additional tooling.

### Using the embedded PDF viewer

To view original PDFs inside the app, install a **development build** instead of
opening the project in Expo Go:

1. On a Mac, install Xcode and its required components, plus CocoaPods using a
   current Ruby and CMake for native builds. Add your Apple Account in
   **Xcode → Settings → Accounts** for development signing.
2. Connect your iPhone by USB, unlock it, and accept **Trust This Computer**.
   Pair it in Xcode's **Window → Devices and Simulators** if necessary.
3. Enable **Settings → Privacy & Security → Developer Mode** on the iPhone and
   follow its restart prompts. Pair with Xcode first if the option is missing.
4. From `mobile/`, run:

   ```bash
   npx expo run:ios --device
   ```

5. Choose your iPhone and follow any signing prompts. This builds and installs
   the native app, then starts the development server. If signing needs a unique
   bundle identifier, configure `expo.ios.bundleIdentifier` in `mobile/app.json`.

For later JavaScript-only development sessions, run:

```bash
npx expo start --dev-client --lan
```

Open the installed development app (currently named **mobile**) and connect to
Metro, or scan its QR code. Keep the phone and Mac on the same Wi-Fi and allow
the app's local network access when prompted. Use `--tunnel` instead of `--lan`
if the network blocks the connection.

After adding native dependencies or changing native config plugins, rerun the
device build. A JavaScript reload or `expo start --clear` cannot add native
modules to an already-installed app. A “native module is not available” error
usually means you need this rebuild or are opening the project in Expo Go.

## Running on a physical Android phone

- **Expo Go:** install Expo Go, use the same Wi-Fi as your computer, run
  `npx expo start --go` from `mobile/`, and scan the QR code in Expo Go.
- **Development build with the PDF viewer:** configure Android Studio and its
  SDK, enable USB debugging on the phone, connect it by USB, and run
  `npx expo run:android --device`. Approve the phone's debugging prompt. For
  subsequent sessions, use `npx expo start --dev-client --lan`.

## Development

Changes to the source code automatically appear in the emulator through Expo's Fast Refresh.

To restart Expo and clear its cache:

```bash
npx expo start --clear
```
