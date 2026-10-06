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

Android emulator talks to the web app at `http://10.0.2.2:3001` (`src/config.ts`). Store slug is `demo`.

Physical device:

```bash
adb reverse tcp:3001 tcp:3001
```

Then keep `10.0.2.2` for the emulator, or set `API_BASE_URL` to `http://YOUR_LAN_IP:3001`.

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
