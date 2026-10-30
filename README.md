# VolleySim

A volleyball rotation and gameplay simulator for Android, built with Expo (React Native), TypeScript, NativeWind, React Native SVG, AsyncStorage and Expo Router. It works fully offline: no backend, accounts or external APIs.

## Features

- **Home dashboard** with quick links, a "match in progress" card and recent matches.
- **Rotation Simulator**: SVG court viewed from above, six position markers, Rotate / Reset, rotation number (1–6), serve indicator on Position 1, numbered or names lineup, tap a player for details.
- **Lineup setup**: team name, six players, jersey numbers, setter, optional libero (back row only).
- **Live match**: two editable teams, scoreboard, +1 point buttons, serve indicator, automatic rotation, set and match tracking, undo, reset, history, both teams shown on one court.
- **Learn positions**: tappable court with clockwise flow arrows, front vs back row, positions vs roles.
- **Rules**: rally, scoring, rotation, substitutions, libero, rotational and positional faults (with diagram), set and match wins.
- **Settings**: show names, optionally save match progress, erase saved data.

### Scoring and rotation rules implemented

- Rally scoring. Sets 1–4 go to 25, deciding 5th set to 15, always win by 2. Best of 5.
- **Practice mode**: choose the target score (3–50) and 1, 3 or 5 sets.
- A team rotates **only** when it wins a rally while receiving serve (and so gains the serve). A serving team that wins scores without rotating.
- Clockwise order: 2 → 1 → 6 → 5 → 4 → 3 → 2 (the player in Position 2 moves into Position 1 and serves).
- Each new set starts both teams in their starting rotation, and the first serve alternates between sets.

## Project structure

```
src/
  app/            Expo Router screens (index, setup, rotation, gameplay, lineup, learn, rules, settings)
  components/     VolleyballCourt, PlayerMarker, Scoreboard, TeamCard, PrimaryButton, Screen, ...
  features/
    rotation/rotationLogic.ts     pure rotation functions
    gameplay/scoringLogic.ts      pure scoring rules
    gameplay/matchState.ts        match state machine (points, undo, reset)
  constants/      court positions, roles, team colors
  state/          AppContext (state + optional local persistence)
  types/          shared TypeScript types
  utils/storage.ts  AsyncStorage helpers (failures never crash the app)
  __tests__/      Jest unit tests for rotation and scoring
```

Game logic never imports React, so it is unit-tested directly.

## Setup

Requires Node 18+ and npm.

```bash
npm install
npx expo start            # then press "a" for an Android emulator, or scan the QR code in Expo Go
```

If you ever need to re-add the dependencies from scratch:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar \
  react-native-svg @react-native-async-storage/async-storage react-native-reanimated @expo/vector-icons expo-font expo-asset
npm install nativewind@^4.1.23 tailwindcss@^3.4.17 query-string@^7.1.3
```

> `query-string` is listed explicitly because `expo-router` 5 imports it but newer `@react-navigation` releases no longer install it.

### Checks

```bash
npm test            # Jest: rotation + scoring + match state
npm run typecheck   # tsc --noEmit
```

## Build an installable APK (EAS Build)

`eas.json` already defines three profiles:

| Profile          | Output | Use                                     |
| ---------------- | ------ | --------------------------------------- |
| `preview`        | APK    | Install directly on a phone (start here) |
| `production-apk` | APK    | Release-signed APK                       |
| `production`     | AAB    | Play Store upload                        |

```bash
npm install -g eas-cli
eas login                                   # free Expo account
eas init                                    # links the project, adds the project ID to app.json
eas build --platform android --profile preview
```

When the build finishes, EAS prints a download link and QR code for the `.apk`. The first build asks to generate an Android keystore; accept so EAS manages it.

## Install the APK on an Android phone

1. Open the EAS build link on the phone (or download the `.apk` on a computer and copy it over via USB or cloud storage).
2. Tap the downloaded file. If prompted, allow installs from this source (Settings → Apps → Special access → Install unknown apps).
3. Tap **Install**, then **Open**.

With USB debugging enabled you can also run `adb install path/to/app.apk`.

## Play Store later

Use `eas build --platform android --profile production` for an `.aab`, then `eas submit --platform android`. The package name is `com.volleysim.app` (change it in `app.json` before publishing if you want your own).
