# LOKL (mobile app)

**LOKL** is an iOS and Android app for finding places to play and train in New York City (courts, gyms, studios
and other venues), joining events and groups, posting, and chatting with other people. Venue owners can sign up
as **Business** accounts and publish their own events and clips.

Built with **React Native + Expo (Expo Router)**, styled with **NativeWind (Tailwind)**. It talks to the
[Lokl-backend](https://github.com/Ibrahimkhalill/Lokl-backend) API (`https://api.loklusa.com`).

## Features

- **Two account types** — personal (phone + password, SMS verification) and business sign-in/sign-up.
- **Explore** — NYC venues on a map and list, with search, filters, photos and friends' opinions.
- **Events and groups** — browse, create and join events, reviews, galleries, group chats.
- **Posts and profiles** — feed, likes, comments, follow, streaks, blocked users.
- **Chat** — inbox and real-time conversations.
- **Push notifications** — via Expo (`expo-notifications`), plus in-app notifications.
- **Safety and settings** — report/block, privacy and security, delete account, terms and privacy policy.

## Tech

Expo + Expo Router (file-based routes in `app/`), NativeWind, `react-native-maps`, `expo-location`,
`expo-notifications`, `expo-image-picker`, `expo-video`, axios. Over-the-air updates via `expo-updates`.

## Project layout

| Folder | Contents |
|--------|----------|
| `app/` | Screens and routes (`auth/`, `(tabs)/`, `home/`, `events/`, `chat/`, `business/`, `settings/`, `user/`) |
| `components/`, `hooks/`, `context/` | Reusable UI, hooks and app state |
| `services/`, `lib/`, `constants/`, `types/` | API calls, helpers, theme constants, types |
| `assets/` | Images, fonts, icons |

## Run locally

```bash
yarn install
yarn start        # Expo dev server (use a dev build: expo-dev-client)
yarn ios          # or: yarn android
```

Environment variables: `EXPO_PUBLIC_API_URL` (defaults to the production API) and `GOOGLE_MAPS_API_KEY` (read in `app.config.js`; set it as an EAS env var for builds). Never commit secrets.

## Build and release

Builds run on **EAS** (Expo organization `lokl-inc`, project `@lokl-inc/lokl-app`):

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios      # TestFlight / App Store
```

iOS bundle id `com.loklusa.app`, Android package `com.lokl.app`. Node 22 and Yarn 4 are pinned for EAS
(`eas.json`, `.yarnrc.yml`).

---

# LOKL Auth — Screen Structure

## Colors
| Token | Value |
|---|---|
| Primary | `#D1FF00` |
| Background | `#14161A` |
| Card | `#1E2128` |
| Modal Header | `#0077FF` |

---

## Navigation Flow

```
/ (index)                    → Splash Carousel (4 slides with bg images)
  └─ "Get Started"
      └─ /auth/sign-in       → Sign In
          ├─ "Sign Up"       → /auth/sign-up
          │     └─ "Sign Up" → /auth/otp
          ├─ "Forgot?"       → /auth/forgot-password
          │     └─ "Next"    → /auth/otp
          │           └─ "Verify" → /auth/reset-password
          │                         └─ "Next" → /auth/sign-in
          └─ "Sign In"       → /auth/choose-role
                ├─ Personal  → /auth/what-looking-for
                │               └─ /auth/what-are-you-into
                │                     └─ /auth/location
                │                           └─ /auth/congratulations
                └─ Business  → /auth/business-signup
                                └─ /auth/otp → /auth/congratulations
```

---

## All Screens

| File | Screen | Notes |
|---|---|---|
| `app/index.tsx` | Splash Carousel | 4 slides, auto-advance, dot indicators |
| `app/auth/sign-in.tsx` | Sign In | Phone + Password, Google/Apple |
| `app/auth/sign-up.tsx` | Sign Up | 5 fields + Remember Me |
| `app/auth/forgot-password.tsx` | Forgot Password | Phone input |
| `app/auth/otp.tsx` | OTP Verification | 6-digit input, auto-focus |
| `app/auth/reset-password.tsx` | Reset Password | New + Confirm |
| `app/auth/choose-role.tsx` | Choose Role | Personal / Business cards |
| `app/auth/business-signup.tsx` | Business Sign Up | Full form + modals |
| `app/auth/what-looking-for.tsx` | What Looking For | Multi-select list |
| `app/auth/what-are-you-into.tsx` | What Are You Into | Tag grid + search |
| `app/auth/location.tsx` | Location Permission | Enable / Skip |
| `app/auth/congratulations.tsx` | Congratulations | Auto-redirects in 3s |
| `app/auth/terms.tsx` | Terms & Conditions | Scrollable sections |

---

## Modals (inside business-signup.tsx)
- **Business Type Modal** — searchable list, header `#0077FF`
- **Social Media Modal** — platform picker, header `#0077FF`

---

## Install & Run

```bash
npm install
npx expo start
```

Scan QR with Expo Go app, or press `i` for iOS simulator / `a` for Android.
