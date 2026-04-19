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
