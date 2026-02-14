# test-backend

Temporary Express + TypeScript backend for local frontend development.

## Features

- Express API with standard response envelope
- In-memory data store with seed records
- Zod request validation
- Centralized error handling
- Request logging via `pino-http`
- Dev-only JWT auth for admin features

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Server defaults to `http://localhost:5000`.
Dev mode runs `src/index.ts` via nodemon and hot-restarts only when files in `src/` change.

## Test Admin Login

- Email: `admin@64x.com`
- Password: `password`

Login endpoint: `POST /api/v1/auth/login`

Protected endpoint example: `GET /api/v1/admin/ping`

Use `Authorization: Bearer <token>` for protected endpoints.

## Auth Flow Endpoints (aligned to `Docs/scretch.md`)

- `POST /api/v1/auth/register/preVerification`
- `POST /api/v1/auth/register/flow/usernameAvailability`
- `POST /api/v1/auth/register/flow/Verification`
- `POST /api/v1/auth/register/flow/ProfileImage`
- `POST /api/v1/auth/register/flow/Setup`
- `POST /api/v1/auth/register/flow/Invalidate`
- `POST /api/v1/auth/forgetPassword`
- `POST /api/v1/auth/forgetPassword/flow/validate`
- `POST /api/v1/auth/forgetPassword/flow/reset`
- `POST /api/v1/auth/forgetPassword/flow/Invalidate`

## Planner Endpoints (aligned to `Docs/scretch.md`)

- `GET /api/v1/planner/bucket`
- `GET /api/v1/planner/bucket/required`
- `GET /api/v1/planner/bucket/optional`
- `GET /api/v1/planner/bucket/:todoId`
- `POST /api/v1/planner/bucket`
- `PUT /api/v1/planner/bucket/:todoId`
- `DELETE /api/v1/planner/bucket/:todoId`
- `PUT /api/v1/planner/bucket/:todoId/disable`
- `PUT /api/v1/planner/bucket/:todoId/enable`
- `GET /api/v1/planner/plan/required`
- `POST /api/v1/planner/plan/setup`
- `PUT /api/v1/planner/plan/setup`
- `DELETE /api/v1/planner/plan/setup`
- `GET /api/v1/planner/plan`
- `PUT /api/v1/planner/plan/:todoId/complete`
- `GET /api/v1/planner/history`
- `GET /api/v1/planner/history/:date`
- `GET /api/v1/planner/history/TODO/:todoId`

For local testing, OTP is `242400` by default.

## Environment Variables

- `PORT`: API port (default `5000`)
- `ALLOWED_ORIGINS`: comma-separated allowed origins for CORS
- `ADMIN_EMAIL`: admin login email for dev auth
- `ADMIN_PASSWORD`: admin login password for dev auth
- `JWT_SECRET`: secret used to sign JWT tokens
- `JWT_EXPIRES_IN`: token lifetime (default `8h`)
- `AUTH_OTP_CODE`: OTP used for mock register/forgot flows (default `242400`)
- `LOG_PRETTY`: pretty-print logs in non-production mode (`true` by default)

Example:

```env
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ADMIN_EMAIL=admin@64x.com
ADMIN_PASSWORD=password
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=8h
AUTH_OTP_CODE=242400
LOG_PRETTY=true
```

## API Contract

See `test-backend/api-contract.md`.
