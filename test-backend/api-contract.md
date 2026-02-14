# Test Backend API Contract

This temporary contract follows `Docs/scretch.md` endpoint naming for auth and planner flows.

## Base Paths

- Health: `/api/health`
- Versioned API: `/api/v1`

## Standard Response Envelope

Success envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Failure envelope:

```json
{
  "ok": false,
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

`error.details` is optional.

## Auth Endpoints (`/auth`)

- `POST /api/v1/auth/login`
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

## Planner Endpoints (`/planner`)

Bucket management:

- `GET /api/v1/planner/bucket`
- `GET /api/v1/planner/bucket/required`
- `GET /api/v1/planner/bucket/optional`
- `GET /api/v1/planner/bucket/:todoId`
- `POST /api/v1/planner/bucket`
- `PUT /api/v1/planner/bucket/:todoId`
- `DELETE /api/v1/planner/bucket/:todoId`
- `PUT /api/v1/planner/bucket/:todoId/disable`
- `PUT /api/v1/planner/bucket/:todoId/enable`

Daily planning:

- `GET /api/v1/planner/plan/required`
- `POST /api/v1/planner/plan/setup`
- `PUT /api/v1/planner/plan/setup`
- `DELETE /api/v1/planner/plan/setup`
- `GET /api/v1/planner/plan`
- `PUT /api/v1/planner/plan/:todoId/complete`

History tracking:

- `GET /api/v1/planner/history`
- `GET /api/v1/planner/history/:date`
- `GET /api/v1/planner/history/TODO/:todoId`

## Admin/Test UI Endpoints

The frontend admin pages still use these protected endpoints:

- `GET /api/v1/admin/ping`
- `GET /api/v1/dashboard`
- `GET /api/v1/customers`
- `GET /api/v1/customers/:customerId`
- `DELETE /api/v1/customers/:customerId`
- `GET /api/v1/inbox`
