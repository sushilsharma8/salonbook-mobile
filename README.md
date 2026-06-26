# SalonBook Mobile

React Native app for [SalonBook](../SalonBook) — discover salons, book appointments, and manage salons on iOS and Android. Supports **Customer**, **Seller**, and **Admin** roles.

Built with **Expo SDK 56**, **Expo Router**, **NativeWind**, and **TanStack Query**.

## Prerequisites

- Node.js 20+
- SalonBook API running (see parent repo `npm run dev` on port 3000)
- Expo Go app on your phone, or iOS Simulator / Android Emulator

## Setup

```bash
cd salonbook-mobile
npm install
cp .env.example .env
```

Edit `.env` and set `EXPO_PUBLIC_API_URL`:

| Environment | URL |
|-------------|-----|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical device | `http://YOUR_LAN_IP:3000` |
| Production | `https://your-app.vercel.app` |

## Run

```bash
# Start Expo dev server
npm start

# Or launch directly
npm run ios
npm run android
```

Make sure the SalonBook backend is running:

```bash
cd ../SalonBook
npm run dev
```

## Demo accounts (after `npm run seed` in SalonBook)

| Role | Email | Password |
|------|-------|----------|
| Customer | customer1@example.com | password123 |
| Seller | seller1@example.com | password123 |
| Admin | admin@example.com | password123 |

After login, the app routes by role:
- **Customer** → Explore / Bookings / Profile tabs
- **Seller** → Dashboard / Salon / Bookings / Share / Account tabs
- **Admin** → Dashboard / Users / Salons / Account tabs

## Features

### Customer
- **Explore** — search salons, filter by category, open-now badges, ratings
- **Salon detail** — photo gallery, gender-aware service pricing (₹), reviews
- **Booking** — pick services → date → time slots → confirm (pay at shop)
- **Bookings** — upcoming/past tabs, cancel, WhatsApp share, Google Maps directions
- **Reviews** — leave a review after completed visits
- **Profile** — edit name, phone, gender; secure JWT storage

### Seller
- **Dashboard** — stats, launch checklist, pending booking alerts
- **Salon** — profile, weekly hours, categories, photo upload, services, staff
- **Bookings** — active/past tabs; accept, reject, complete, no-show
- **Share** — QR code and shareable booking link
- **Booking action links** — `/booking/action/:token` for WhatsApp deep links

### Admin
- **Dashboard** — platform stats and recent activity
- **Users** — list, delete, reactivate, reset password
- **Salons** — tap to manage any salon's services, staff, and bookings

## Project structure

```
app/
  (tabs)/           # Customer: explore, bookings, profile
  (seller)/         # Seller tab group
  (admin)/          # Admin tab group
  admin/salon/[id]  # Admin salon management
  booking/action/[token]  # Token-based booking response
  salon/[id].tsx    # Customer salon detail + booking
  login.tsx / register.tsx
lib/
  api.ts            # REST client + types (customer, seller, admin)
  auth-store.ts     # Zustand + SecureStore
  bookingTime.ts    # India wall-clock time helpers
  routing.ts        # Role-based home routes
components/         # Shared UI
```

## Commands

### Development

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm start` | Start Expo dev server (scan QR with Expo Go) |
| `npm start -- --clear` | Start with cleared Metro bundler cache |
| `npm run ios` | Build and open on iOS Simulator |
| `npm run ios:device` | Build and open on iOS Device |
| `npm run android` | Build and open on Android Emulator |
| `npx expo run:android` | Build and open on Android Device |
| `npm run web` | Start web version in browser |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |

### Expo CLI (run via `npx`)

| Command | Description |
|---------|-------------|
| `npx expo start --tunnel` | Use ngrok tunnel (physical device on different network) |
| `npx expo start --offline` | Start in offline mode |
| `npx expo start --go` | Force Expo Go mode (no dev client) |
| `npx expo start --dev-client` | Force custom dev client mode |
| `npx expo install` | Install Expo-compatible package versions |
| `npx expo doctor` | Check for dependency version mismatches |
| `npx expo prebuild` | Generate native `ios/` and `android/` folders |
| `npx expo prebuild --clean` | Regenerate native folders from scratch |

### EAS Build & Submit

> Requires [EAS CLI](https://docs.expo.dev/build/setup/) and an [Expo account](https://expo.dev).

#### Quick start — installable Android APK on your phone

Best for testing your real app icon, splash screen, and native build (not Expo Go).

```bash
# 1. Install EAS CLI and log in
npm install -g eas-cli
eas login

# Or without a global install:
npx eas-cli@latest login

# 2. Build an installable Android APK
eas build --profile preview --platform android
# (with npx: npx eas-cli@latest build --profile preview --platform android)
npx eas-cli@latest build --profile preview --platform android
```

When prompted on the first Android build, let EAS create a keystore. When the build finishes, open the download link on your Android phone and install the APK.

The `preview` profile in `eas.json` is set to `buildType: "apk"` so builds are easy to sideload (AAB is harder to install directly).

| Profile | Use case |
|---------|----------|
| `preview` | Install on your phone for testing (icon, splash, etc.) |
| `development` | Dev client with hot reload (more setup) |
| `production` | Play Store release |

**Expo Go vs EAS preview build**

| Approach | Best for |
|----------|----------|
| `npm start` + Expo Go | Fast JS/UI iteration; does not use your custom app icon |
| `eas build --profile preview` | Full native app with your scissors icon and splash |

#### All EAS commands

| Command | Description |
|---------|-------------|
| `eas login` | Log in to your Expo account |
| `eas whoami` | Check currently logged-in EAS account |
| `eas build --platform ios` | Build iOS app in EAS cloud |
| `eas build --platform android` | Build Android APK/AAB in EAS cloud |
| `eas build --platform all` | Build both platforms |
| `eas build --profile preview --platform android` | Build preview APK for testing on a physical device |
| `eas build --local --platform ios` | Build locally (requires Xcode) |
| `eas submit --platform ios` | Submit iOS build to App Store |
| `eas submit --platform android` | Submit Android build to Play Store |
| `eas update` | Push OTA JS update (no app store required) |
| `eas update --branch preview` | Push update to a specific branch |
| `eas credentials` | Manage signing credentials |

### Native / Cache

| Command | Description |
|---------|-------------|
| `npx react-native start --reset-cache` | Reset Metro cache |
| `watchman watch-del-all` | Clear Watchman file-watch state |
| `cd ios && pod install` | Install CocoaPods (after `expo prebuild`) |
| `cd android && ./gradlew clean` | Clean Android Gradle build |

## Design

Visual language matches the SalonBook web app (stone/amber palette, Outfit + Inter fonts). See [SalonBook/docs/UI_DESIGN_PROMPT.md](../SalonBook/docs/UI_DESIGN_PROMPT.md).

## API

Uses the same REST API as the web app. Full spec: [SalonBook/docs/openapi.yaml](../SalonBook/docs/openapi.yaml).

Auth: `Authorization: Bearer <jwt>` on protected routes.

## Notes

- Booking times use **India local wall-clock** (no timezone offset on display).
- Android allows HTTP cleartext for local dev (`usesCleartextTraffic: true` in `app.json`).
- Payments are **pay at shop** only — no in-app payment gateway.
- Menu OCR / bulk service import is not included in mobile v1 (use web dashboard).

## Testing each role

1. Start SalonBook backend (`npm run dev`) and mobile app (`npm start`).
2. **Customer**: log in as `customer1@example.com` → browse Explore, book a salon, view Bookings.
3. **Seller**: log in as `seller1@example.com` → check Dashboard checklist, edit Salon tab, manage Bookings.
4. **Admin**: log in as `admin@example.com` → view stats, manage Users, open a salon from Salons tab.
5. **Register**: create a new Seller account from the register screen (Customer | Seller toggle).
