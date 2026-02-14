# Financial App API Endpoints

> **Note**: DO NOT IMPLEMENT - This is just to make a clear structure of the API endpoints. Actual implementation may differ.

All endpoints live under `/api/v1/`.

## Authentication (`/auth`)

Manages new users and logins.

### Login
```
POST /login
Body: { username/Email, password }
Protocol: HTTPS
```

### Registration Flow
```
POST /register/preVerification
Body: { email }
Returns: registerToken // OTP will be sent

POST /register/flow/usernameAvailability
Body: { token, username }

POST /register/flow/Verification
Body: { token, OTP }

POST /register/flow/ProfileImage
Body: { base64Image }
Returns: profileImageUUID

POST /register/flow/Setup
Body: { nickname, username, password, profileImageUUID }

POST /register/flow/Invalidate
Body: { token }
```
> Note: If using server-side sessions, the token is not important.

### Password Reset Flow
```
POST /forgetPassword
Body: { username/email }
Returns: forgetPasswordToken

POST /forgetPassword/flow/validate
Body: { OTP, token }

POST /forgetPassword/flow/reset
Body: { newPassword }

POST /forgetPassword/flow/Invalidate
Body: { token }
```

## Productivity Dashboard (`/productivity`)

Since it's basically a dashboard, let's leave it to design later after others are finished.

## Planner (`/planner`)

This is the timetable and TODO planner. Each user has a bucket of TODO items that repeat on specific time periods, and some have specific times or dates to do (e.g., bath is a TODO that repeats every two days, while eating repeats every six hours a day).

At the start of the day, the user must look at their bucket and select TODOs to do today according to these rules:
- If a TODO's deadline is today, it must be done today (e.g., cleaning the kitchen TODO repeats once every week on Monday; today is Sunday, so the user should select it to do today)
- Users can select TODOs before the deadline (e.g., user can clean the kitchen on Friday, but when done after specific times it said "one for week, two for week" - user can't do it again)
- Users can skip TODOs to the next day only if the TODO's deadline is not today. If the deadline is today and the user can't finish it, it will be added to failed TODOs

### Bucket Management
```
GET /bucket
Returns: All TODOs with structured required/optional listing
Sub-resources: /bucket/required, /bucket/optional

GET /bucket/{ID}
Returns: Data of specific TODO

POST /bucket
Body: { TODO data }
Action: Add new TODO to bucket

PUT /bucket/{ID}
Body: { updated TODO data }
Action: Edit specific TODO

DELETE /bucket/{ID}
Action: Soft delete a TODO

PUT /bucket/{ID}/disable
Action: Disable a TODO without deleting it

PUT /bucket/{ID}/enable
Action: Enable a disabled TODO
```

### Daily Planning
```
GET /plan/required
Returns: List of TODOs that are required to do today

POST /plan/setup
Body: { list of TODO IDs }
Action: User selects TODOs to do today (only callable once per day, must include required tasks)

PUT /plan/setup
Body: { TODO ID }
Action: Alter/add new TODO item for today

DELETE /plan/setup
Body: { TODO ID }
Action: Skip the TODO back to the bucket (cannot be called on tasks with today's deadline or already finished tasks)

GET /plan
Returns: List of TODOs user selected to do today with completion status

PUT /plan/{ID}/complete
Action: Mark the TODO as completed
```

### History Tracking
```
GET /history
Returns: All available dates that user has TODO history with completion status

GET /history/{date}
Returns: List of TODOs user did on specific date with completion status

GET /history/TODO/{ID}
Returns: History of specific TODO with completion status, dates it was done, disabled dates, etc.
```

## Wallet (`/wallet`)

This is the financial management part of the app. Users can add multiple wallets (cash, bank account, credit card, etc.) and track their income and expenses.

*In Designing*

## Diary (`/diary`)

This is the personal diary part of the app. Users can add daily notes, thoughts, feelings, etc., and track their performance on other parts of the app such as planner and wallet.

*In Designing*

## Admin (`/admin`)

For managing the app. Only accessible by admin users.

*In Designing*