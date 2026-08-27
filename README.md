# ShopSaaS

Multi-tenant ecommerce SaaS built with Next.js 14, TypeScript, and a JSON-file data layer. It includes a super-admin portal, a store-admin portal, and customer storefronts with guest cash-on-delivery checkout.

## Run locally

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`.

Seed accounts:

- Super admin: `super@platform.com` / `admin123`
- Store admin: `admin@demo.com` / `admin123`
- Demo storefront: `http://localhost:3000/store/demo`

`npm run seed` is safe to run against an empty data directory. It preserves existing records and adds demo catalog data only when the demo store has no categories.

## Features

- Role-protected super-admin and store-admin dashboards
- Admin/store CRUD, product catalog, categories, coupon discounts, order status updates, customer roll-up, analytics, and notification polling
- Public store routes by slug with catalog search, filtering, product options, localStorage cart, and COD checkout
- Server-side order validation, stock reduction, and store-admin notifications
- JSON database files in `data/`; uploaded files are stored under `public/uploads/`

## Configuration and deployment

Set a strong `JWT_SECRET` in the deployment environment before production use. The current JSON storage requires a persistent filesystem, so it works well locally or on a persistent Node host. Serverless filesystems such as Vercel are not suitable for durable order data or uploads without replacing the data/upload layer with a managed database and object storage service.

Use `npm run build` for the production compilation check and `npm start` to serve the build.
