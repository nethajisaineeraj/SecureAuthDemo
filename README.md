# SecureAuth – Role-based Authentication (JWT Access + Refresh)

A full-stack example using Express + SQLite on the backend and Create React App on the frontend.

- Access token (short-lived) in memory on the client
- Refresh token (long-lived) as httpOnly cookie with rotation
- Role-based routes (admin, user)

---

## Tech Stack

- Backend: Node.js, Express.js, better-sqlite3, jsonwebtoken, bcryptjs, cookie-parser, cors, dotenv
- Frontend: React (CRA), react-router-dom, styled-components
- Database: SQLite (local file `backend/data.sqlite`)

---

## Prerequisites

- Node 20 LTS (recommended). Project uses nvm for Windows in dev.
- npm

---

## Project Structure

```
SecureAuth/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/userModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   └── bootstrapAdmin.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── RoleRestrictedRoute.jsx
    │   │   ├── LoginForm.jsx
    │   │   ├── RegisterForm.jsx
    │   │   └── ui/ (Container, Card, Input, Button, Navbar)
    │   ├── context/AuthContext.jsx
    │   └── pages/ (Home, Login, Register, Dashboard, AdminPage, Unauthorized)
    └── package.json
```

---

## Backend Setup

1) Install dependencies

```
cd backend
npm install
```

2) Configure environment

Create `backend/.env` from `.env.example` and set values:

```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=<strong_random_string>
JWT_REFRESH_SECRET=<strong_random_string>
ACCESS_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d
# Optional bootstrap admin (dev convenience)
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=StrongPass!123
```

Notes:
- `CORS_ORIGIN` should include the CRA origin (default http://localhost:3000).
- The SQLite database file is created automatically at `backend/data.sqlite`.
- On server start, `bootstrapAdmin.js` will create or promote the user with `ADMIN_EMAIL` to `admin`.

3) Run the backend

```
npm run dev
```

Backend runs on http://localhost:5000

---

## Frontend Setup

1) Install dependencies

```
cd ../frontend
npm install
```

2) Start the frontend

```
npm start
```

Frontend runs on http://localhost:3000

---

## Authentication Flow

- Login/Register
  - POST `/api/auth/login` or `/api/auth/register`
  - Response includes `accessToken` and `user` (id, email, role)
  - Refresh token is set as `httpOnly` cookie (`/api/auth` path)
- Access token usage
  - Stored in memory in `AuthContext`
  - Sent as `Authorization: Bearer <token>` header
- Auto refresh
  - `client.js` retries once when a request returns 401 by calling `/api/auth/refresh`
  - On success, replaces the access token and retries the original request
- Logout
  - POST `/api/auth/logout` clears the stored refresh token and cookie

---

## API Endpoints (Backend)

Auth (prefix `/api/auth`):
- POST `/register` – create user (role defaults to `user`)
- POST `/login` – get access + refresh tokens
- POST `/refresh` – rotate refresh, return new access token
- POST `/logout` – invalidate refresh token and clear cookie

Users (prefix `/api/user`):
- GET `/profile` – requires authentication
- GET `/admin` – requires role `admin`

---

## Roles

- Supported: `user`, `admin`
- Middleware:
  - `authMiddleware` verifies access token and populates `req.user`
  - `roleMiddleware(["admin"])` enforces role-based access

To test admin locally:
- Set `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env` and restart backend
- Login with those credentials and visit `/admin` on the frontend

---

## Frontend Notes

- Router: `react-router-dom`
- State: `AuthContext` provides `{ user, accessToken, login, register, logout }`
- HTTP: `fetch` wrapper (`src/api/client.js`) with `credentials: 'include'` to send cookies
- Styling: `styled-components` with simple UI primitives (Container, Card, Input, Button, Navbar)

---

## Security Considerations

- Refresh tokens are httpOnly cookies (not readable by JS)
- Access tokens are short-lived and kept in memory
- On production:
  - Set `NODE_ENV=production`
  - Serve frontend from a trusted domain
  - Configure CORS precisely (origins list) and HTTPS
  - Consider CSRF protections for cookie-based flows (sameSite/CSRF token strategy)
  - Rotate JWT secrets regularly and store them securely

---

## Troubleshooting

- Registration/Login fails:
  - Check backend console for errors
  - Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set in `.env`
  - Confirm `CORS_ORIGIN=http://localhost:3000`
- 401 after some time:
  - Confirm refresh cookie is set (browser devtools Application → Cookies)
  - Ensure requests include credentials and server has `credentials: true` in CORS
- Admin page shows Unauthorized:
  - Log out and log back in (new access token must reflect elevated role)

---

## Scripts

Backend:
- `npm run dev` – start backend with nodemon
- `npm start` – start backend with node

Frontend:
- `npm start` – start CRA dev server
- `npm run build` – production build

---

## License
Copyright © 2025 Nethaji Sai Neeraj Mahanthi

- GitHub: https://github.com/nethajisaineeraj
- Portfolio: https://saineerajmahanthi.vercel.app/
- LinkedIn: https://linkedin.com/in/netaji-sai-neeraj-mahanthi
- Email: saineerajmahanthi@gmail.com
- Phone: +91 74168 27212

