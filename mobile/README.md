# TailorMade Mobile

React Native (Expo) app for tailors. Offline-first with sync; push reminders 3 days and 24h before collection.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_API_URL` – backend API URL
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS` / `ANDROID` / `WEB` for Google Sign-In
3. `npx expo start`

## Builds

- **Android APK**: `eas build --platform android --profile preview` (configure EAS first: `eas build:configure`)
- **iOS TestFlight**: `eas build --platform ios --profile preview` then submit with EAS Submit

## Features

- Username/password sign-in and sign-up
- Profile, clients, sewing tickets (with measurements, fabric images, payment, due date)
- Offline-first: data stored locally, sync when online
- Local notifications: 3 days and 24h before collection due date
- GDPR: Export my data, Delete my account (Profile)

## Compliance

- GDPR: export and delete account in Profile
- Use privacy policy and app store listing text per Play Store and App Store guidelines
