# Shop mobile (React Native CLI, Android first)

Customer storefront for the existing Next.js APIs. Web stays at the repo root; this folder is a separate app with its own `package.json`.

## Run

In one terminal, start the website (APIs live here):

```bash
yarn dev
```

In another:

```bash
yarn mobile:start
yarn mobile:android
```

Or from this folder:

```bash
yarn start
yarn android
```

### Local debug

Emulator uses `http://10.0.2.2:3001` (`src/config.ts`). Store slug is `demo` (`STORE_SLUG`).

Physical device:

```bash
adb reverse tcp:3001 tcp:3001
```

### Live / release APK

1. Deploy the Next.js website (same APIs + Supabase) to a public HTTPS URL.
2. In `mobile/src/config.ts`, set `LIVE_API_BASE_URL` to that URL (example: `https://rmmobilehub.com`).
3. Keep `STORE_SLUG` equal to the live store slug / `DEFAULT_STORE_SLUG`.
4. Build release APK — `__DEV__` is false, so the app calls the live URL, not localhost.
5. You can stop local `yarn/npm run dev`; the phone does not need your PC.

## Included in this first Android release

- Home, shop (search / category / sort), product, cart, COD checkout, coupons
- Order confirmation + WhatsApp order request
- Phone check estimate, doorstep repair booking, contact / lead form

## Not in this app yet

- Admin / super-admin
- iOS run target (folder exists from the CLI template; not set up)
- Website chatbot conversation UI
- Leaflet map pin for doorstep location
- Video ads
- Play Store listing, push notifications, deep links
