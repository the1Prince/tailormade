# TailorMade

Multi-tenant platform for tailors/seamstresses to manage business operations.

- **Backend**: Node.js + Express, MongoDB (Render)
- **Admin**: React web app (platform owners)
- **Mobile**: React Native (tailors), offline-first, APK + TestFlight

## Structure

- `backend/` – API, auth (username/password), GDPR, GridFS images
- `admin-web/` – Dashboard KPIs, user management
- `mobile/` – Tailor app: profile, clients, sewing tickets, sync, push

## Compliance

- GDPR (EU + Africa): export data, delete account in v1
- Play Store & App Store guidelines

## Branding

- Luxury black & white, serif (Cormorant Garamond)
- Logo: tape measure + TM (see `assets/tailormade-logo.png` in repo root; mobile uses `mobile/assets/icon.png`)

## Quick start

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Admin
cd admin-web && npm install && npm run dev

# Mobile
cd mobile && npm install && npx expo start
```

See each package's README for env vars. **Deploy on Render:** see [DEPLOY.md](./DEPLOY.md) and use `render.yaml` in this repo.
