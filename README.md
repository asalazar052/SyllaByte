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

Once Expo starts:

- **iOS:** Press `i` to launch the iOS Simulator (requires Xcode).
- **Android:** Press `a` to launch the Android Emulator (requires Android Studio).

Make sure the emulator is configured and available.

## Development

Changes to the source code automatically appear in the emulator through Expo's Fast Refresh.

To restart Expo and clear its cache:

```bash
npx expo start --clear
```