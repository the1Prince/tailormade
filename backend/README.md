# TailorMade Backend

- **Port**: 4000 (default)
- **Env**: Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and frontend URLs.

## Create first admin

Admins are users with `role: 'admin'`. They sign in with username or email + password.

In MongoDB or a seed script:

```js
// Create admin user (username + password)
db.users.insertOne({
  username: "admin",
  email: "admin@tailormade.app",
  password: "<bcrypt hash of your password>",
  name: "Platform Admin",
  role: "admin",
  consentTermsAt: new Date()
});
```

Or use bcrypt to hash: `bcrypt.hash('yourPassword', 12)`.

## API summary

- `POST /api/auth/register` – Sign up (body: username, password, email?, name?)
- `POST /api/auth/login` – Sign in (body: usernameOrEmail, password)
- `GET/PATCH /api/users/me` – Profile (auth)
- `CRUD /api/clients` – Clients (tailor)
- `CRUD /api/tickets` – Sewing tickets (tailor)
- `CRUD /api/measurement-templates`, `GET /api/measurement-templates/fixed` – Templates (tailor)
- `POST /api/uploads/fabric` – Fabric images (multipart, max 5), returns `{ ids }`
- `GET /api/gdpr/export` – Export my data
- `DELETE /api/gdpr/delete-account` – Delete account
- `GET /api/admin/dashboard` – KPIs (admin)
- `GET/PATCH/DELETE /api/admin/users`, `GET /api/admin/users/:id`, suspend/unsuspend (admin)
- `GET /api/admin/activity` – Activity log (admin)
