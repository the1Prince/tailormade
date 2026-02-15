# TailorMade – Project Context

## What this is

Multi-tenant platform for tailors/seamstresses to manage business operations. **Platform owners** use the admin web app (dashboard, user management). **Tailors** use the mobile app (profile, clients, sewing tickets) with offline-first sync and collection-due reminders.

## Tech stack

- **Backend**: Node.js, Express, MongoDB (Mongoose). Auth: username/password (JWT). File storage: GridFS for fabric images (max 5 per ticket). Deploy: Render.
- **Admin**: React 18, Vite, React Router 6, Tailwind CSS, Axios. Cormorant Garamond (luxury serif), black/white theme.
- **Mobile**: React Native (Expo), React Navigation (stack + bottom tabs), AsyncStorage (offline cache), NetInfo, expo-notifications (local due-date reminders). Builds: Android APK, iOS TestFlight.

## Project structure

```
tailormade/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   │   ├── User.js          # username, password, email?, name, role (tailor|admin)
│   │   │   ├── Client.js
│   │   │   ├── SewingTicket.js  # status, payment, measurements, fabricImageIds
│   │   │   ├── MeasurementTemplate.js
│   │   │   └── ActivityLog.js
│   │   ├── routes/
│   │   │   ├── auth.js          # register, login
│   │   │   ├── users.js         # /me
│   │   │   ├── clients.js
│   │   │   ├── tickets.js
│   │   │   ├── measurementTemplates.js
│   │   │   ├── uploads.js       # fabric images → GridFS
│   │   │   ├── gdpr.js          # export, delete-account
│   │   │   └── admin.js         # dashboard, users, activity
│   │   ├── services/auth.js, storage.js
│   │   ├── app.js, server.js
│   ├── .env.example
│   └── package.json
├── admin-web/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/Layout.jsx, Logo.jsx
│   │   ├── pages/Login.jsx, Dashboard.jsx, Users.jsx, UserDetail.jsx
│   │   ├── App.jsx, main.jsx, index.css
│   ├── index.html, vite.config.js, tailwind.config.js
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── context/AuthContext.js
│   │   ├── navigation/RootNavigator.js, MainTabs.js
│   │   ├── screens/ LoginScreen, RegisterScreen, DashboardScreen, ClientsScreen,
│   │   │           ClientFormScreen, TicketsScreen, TicketFormScreen, TicketDetailScreen, ProfileScreen
│   │   ├── sync/offlineStore.js, syncService.js
│   │   ├── utils/notifications.js
│   │   ├── components/Logo.js
│   ├── App.js, app.json
│   └── package.json
├── render.yaml       # Blueprint: tailormade-api (Node), tailormade-admin (static)
├── DEPLOY.md
├── context.md        # This file
└── README.md
```

## Auth (username + password)

- **Backend**: `POST /api/auth/register` — body: `username`, `password` (min 8), optional `email`, `name`. Username stored lowercase; letters, numbers, `._-` only. Duplicate username/email → 400.
- **Backend**: `POST /api/auth/login` — body: `usernameOrEmail`, `password`. Returns JWT and user `{ id, username, email, name, role }`.
- **Admin**: Login with username or email + password; only users with `role: 'admin'` can access admin.
- **Mobile**: Login screen (username/email + password) and Register screen (username, password, optional email, name). Token stored in SecureStore.
- **First admin**: Insert in MongoDB a user with `username`, `password` (bcrypt hash), `role: 'admin'`, `consentTermsAt`. See `backend/README.md` and `DEPLOY.md`.

## API summary (backend)

| Method + path | Auth | Purpose |
|---------------|------|---------|
| POST /api/auth/register | — | Sign up (tailor) |
| POST /api/auth/login | — | Sign in (usernameOrEmail, password) |
| GET/PATCH /api/users/me | ✓ | Profile |
| CRUD /api/clients | ✓ tailor | Clients |
| CRUD /api/tickets | ✓ tailor | Sewing tickets (status, payment, measurements, fabricImageIds) |
| CRUD /api/measurement-templates, GET .../fixed | ✓ tailor | Templates + fixed list |
| POST /api/uploads/fabric (multipart, max 5) | ✓ tailor | Fabric images → GridFS; returns `{ ids }` |
| GET /api/gdpr/export, DELETE .../delete-account | ✓ | GDPR |
| GET /api/admin/dashboard | ✓ admin | KPIs, ticketsByStatus, recentSignups |
| GET/PATCH/DELETE /api/admin/users, .../users/:id, suspend/unsuspend | ✓ admin | User management |
| GET /api/admin/activity | ✓ admin | Activity log |

## Key conventions

- **User**: `username` (required, unique), `password` (bcrypt), `email` (optional), `name`, `role` (tailor | admin). Soft delete: `deletedAt`; on delete, `username` set to `deleted_<id>`.
- **Sewing ticket**: status (draft, on_hold, in_progress, ready_for_fitting, completed, collected, cancelled); payment (yet_to_be_paid, part_payment, fully_paid); `payments[]` with amount, paidAt, note; max 5 fabric images (GridFS IDs in `fabricImageIds`).
- **Offline (mobile)**: Clients, tickets, templates cached in AsyncStorage; pending creates/updates/deletes queued and synced when online via `syncWhenOnline()`.
- **Notifications**: Local (expo-notifications): schedule “due in 3 days” and “24h before” from ticket due dates; see `mobile/src/utils/notifications.js`.
- **CORS**: Backend allows `ADMIN_WEB_URL`, `FRONTEND_URL`, localhost.
- **GDPR**: Export (JSON download) and delete account in v1; admin and mobile Profile expose these.

## Admin routes (web)

| Path | Purpose |
|------|---------|
| /login | Username or email + password |
| / | Dashboard (KPIs, tickets by status, recent signups) |
| /users | User list (search username/name/email, filter suspended) |
| /users/:id | User detail, suspend/unsuspend, delete, activity |

## Mobile screens

| Screen | Purpose |
|--------|---------|
| Login, Register | Auth |
| Dashboard | Due-soon count, total tickets, last sync, links to Tickets/Clients |
| Clients | List; + New client → ClientForm |
| ClientForm | Create/edit client (name, phone, email, address, notes) |
| Tickets | List; + New ticket → TicketForm; tap → TicketDetail |
| TicketForm | Client, status, due date, amount, payment status, amount paid, notes |
| TicketDetail | View ticket; Edit → TicketForm |
| Profile | Export data, Delete account, Log out |

## When editing

- **New API endpoint**: Add route in `backend/src/routes/`, mount in `app.js`; use `authGuard` and optionally `adminOnly` or tailor-only check.
- **New User field**: Update `backend/src/models/User.js`; if it should be in JWT or /me, update auth response and `users.js` /me and PATCH.
- **New ticket/client field**: Update model, route validation, and mobile forms + offline store if needed.
- **Admin page**: Add route in `App.jsx`, link in `Layout.jsx`; call `api.get/post/patch/delete` with `VITE_API_URL`.
- **Mobile screen**: Add to `MainTabs.js` or stack; use `api` and/or `offlineStore` + `syncWhenOnline`.
- **Env**: Backend `.env.example` and `render.yaml`; admin `VITE_*`; mobile `EXPO_PUBLIC_*`.
