# AI Upsell Shopify App (MVP)

Production-ready Shopify embedded app scaffold using:
- Frontend: Next.js App Router + React + JavaScript + Shopify App Bridge
- Backend: NestJS + TypeScript + Prisma
- Database: PostgreSQL
- Extension: Theme App Extension (`extensions/ai-upsell-widget`)

## Project Structure

```text
backend/
  common/
  middleware/
  modules/
    auth/
    shop/
    upsell/
    analytics/
  database/
  main.ts

frontend/
  app/
  components/
  auth/
  dashboard/
  widget/
  hooks/
  lib/

extensions/
  ai-upsell-widget/
    blocks/
    assets/
    shopify.extension.toml
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env` and fill values.
2. Install dependencies:
   - `cd backend`
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate:dev`
5. Start backend:
   - `npm run start:dev`

## Frontend Setup

1. Copy `frontend/.env.local.example` to `frontend/.env.local`.
2. Install dependencies:
   - `cd frontend`
   - `npm install`
3. Start frontend:
   - `npm run dev`

## Shopify App Requirements Implemented

- OAuth install and callback:
  - `GET /auth/install`
  - `GET /auth/callback`
- HMAC SHA256 verification:
  - OAuth callback query HMAC
  - Webhook HMAC (`x-shopify-hmac-sha256`)
- Session token JWT validation middleware for embedded admin API requests
- Webhooks:
  - `app/uninstalled`
  - `orders/create`
  - `products/update`
- GraphQL Admin API for Shopify data operations (no REST Admin API usage)
- Upsell engine:
  - same collection
  - product tags
  - manual mapping
- Analytics:
  - impression tracking
  - conversion tracking
- Theme App Extension blocks:
  - product upsell widget
  - cart upsell widget

## Key API Endpoints

- `GET /upsell?shop={shop}&productId={id}`
- `GET /upsell?shop={shop}&cartProductIds=id1,id2`
- `GET /upsell/rules` (session token required)
- `POST /upsell/rules` (session token required)
- `GET /analytics/summary` (session token required)
- `POST /analytics/impression`
- `POST /analytics/conversion`

## Performance Notes

- Recommendation responses are cached in-memory with TTL (`CACHE_TTL_SECONDS`).
- Storefront widget fetch is asynchronous and does not block page rendering.
