Welcome to Authentication App

⸻

# Authorization API Documentation

**Version:** 1.0  
**Last updated:** 27 May 2025  
**Status:** Stable

---

## 1. Overview

This RESTful API provides user authentication, authorization, and account-management features for your application.  
All responses are JSON encoded and follow conventional HTTP status semantics.

**Key capabilities:**

- JWT-based authentication (access & refresh tokens)
- Email verification for new accounts
- Password strength enforcement
- OTP-driven password reset
- Basic user management endpoints

---

## 2. Base URL

https://<SERVER_URL>/api/v1

Replace `<SERVER_URL>` with the value of `SERVER_URL` in your environment configuration.

---

## 3. Content-Type & Authentication

| Header          | Value                   |
| --------------- | ----------------------- |
| Content-Type    | application/json        |
| Authorization\* | Bearer `<access_token>` |

> The Authorization header is required for all protected routes.  
> Access tokens are obtained via Sign In or Refresh Token endpoints.

---

## 4. Error Schema

All error responses have the structure:

```json
{
  "success": false,
  "message": "<human readable message>"
}

Optional fields:
	•	error – a more technical description (returned for token errors).

⸻

5. Endpoints

5.1 Sign Up

POST /auth/sign-up

Field	Type	Constraints
name	string	2–50 characters
email	string	Must be unique & valid email format
password	string	≥ 6 chars, must include number/special char

Responses:
	•	201 Created – Account stored, verification email sent.
	•	400 – Weak password or duplicate verified account.
	•	409 – Account exists but not yet verified.

<details>
<summary>Example request</summary>


curl -X POST https://<SERVER_URL>/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "password": "Secure@123"
      }'

</details>



⸻

5.2 Verify Email

GET /auth/verify-email?token=<jwt>

Sent automatically inside the verification email. Token expires after EMAIL_VERIFY_EXPIRES_IN (e.g., 24h).

Responses:
	•	200 OK – Email verified (idempotent)
	•	400 – Token invalid or expired

⸻

5.3 Sign In

POST /auth/sign-in

Field	Type
email	string
password	string

Success Response (200 OK):

{
  "success": true,
  "message": "User signed in successfully",
  "data": {
    "accessToken": "<jwt_access>",
    "refreshToken": "<jwt_refresh>",
    "user": {
      "_id": "...",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "verified": true,
      "createdAt": "2025-05-27T08:30:55.123Z",
      "updatedAt": "2025-05-27T08:30:55.123Z"
    }
  }
}

Errors:
	•	401 – Invalid password
	•	404 – User not found

⸻

5.4 Sign Out

POST /auth/sign-out

Body:

{ "refreshToken": "<jwt_refresh>" }

Response:
	•	200 OK – Always returns success to avoid token probing

⸻

5.5 Refresh Token

POST /auth/refresh-token

Body:

{ "refreshToken": "<jwt_refresh>" }

Responses:
	•	200 OK – Returns new access & refresh tokens
	•	401 – Token missing
	•	403 – Token expired / invalid / revoked

⸻

5.6 Request Reset OTP

POST /auth/request-reset-otp

Body:

{ "email": "user@example.com" }

Responses:
	•	200 OK – OTP generated (valid 2 minutes)
	•	404 – User not found
	•	429 – OTP requested before cooldown elapsed

⸻

5.7 Verify Reset OTP & Set Password

POST /auth/verify-reset-otp

Field	Type
email	string
otp	string
newPassword	string

Responses:
	•	200 OK – Password updated
	•	400 – Invalid/expired OTP

⸻

5.8 Resend Verification Email

POST /auth/resend-verification

Body:

{ "email": "user@example.com" }

Responses:
	•	200 OK – Link re-sent
	•	400 – Already verified
	•	404 – Unknown email

⸻

5.9 Get Current User

GET /users/me

Headers:

Authorization: Bearer <access_token>

Response:
	•	200 OK – Authenticated user (sans password)

⸻

5.10 Get All Users

GET /users

Protected – requires admin. Remove middleware to expose publicly.

⸻

5.11 Get User By ID

GET /users/{id}

Path parameter: MongoDB ObjectId
Response: 404 if user does not exist

⸻

6. Authentication & Token Details

Token	Env Secret	Lifetime Env Var	Typical Value
Access token	JWT_ACCESS_SECRET	JWT_ACCESS_EXPIRES_IN	15m
Refresh token	JWT_REFRESH_SECRET	JWT_REFRESH_EXPIRES_IN	7d

Access tokens sign API requests.
Refresh tokens are stored server-side and rotated on each refresh.

⸻

7. Password Policy
	•	Minimum 6 characters
	•	Must include at least one digit or special character

Weak passwords → 400 “Password too weak”

⸻

8. Email Flow

Sign-Up → Verification email → GET /verify-email?token=... (24 h expiry)
Unverified accounts cannot sign in.

⸻

9. OTP Password Reset Flow

1️⃣ POST /request-reset-otp → 6-digit code emailed (valid 2m)
2️⃣ POST /verify-reset-otp (email, otp) → Set new password

⸻

10. Common Error Codes

Status	When
400	Validation failure, weak password, bad OTP
401	Missing/invalid access token
403	Invalid or expired refresh token
404	Resource not found (user, token)
409	Sign-up attempt on existing unverified acc
429	OTP requested before cooldown elapsed
500	Unhandled server error


⸻

11. Environment Variables

Variable	Description
SERVER_URL	Base server origin
CLIENT_URL	Front-end origin (for CORS/links)
JWT_ACCESS_SECRET	HMAC secret for access tokens
JWT_REFRESH_SECRET	HMAC secret for refresh tokens
JWT_ACCESS_EXPIRES_IN	Access token TTL (e.g., 15m)
JWT_REFRESH_EXPIRES_IN	Refresh token TTL (e.g., 7d)
EMAIL_VERIFY_SECRET	Secret to sign email verification token
EMAIL_VERIFY_EXPIRES_IN	Verification token TTL (e.g., 24h)
SMTP creds / provider	Used by sendEmail utility


⸻

12. Quick Test Sequence (cURL)

# 1. Sign up
curl -X POST <BASE>/auth/sign-up -H "Content-Type: application/json" -d '{...}'

# 2. Click verification link in email

# 3. Sign in
TOKEN=$(curl -s -X POST <BASE>/auth/sign-in -d '{...}' | jq -r .data.accessToken)

# 4. Access protected route
curl -H "Authorization: Bearer $TOKEN" <BASE>/users/me


⸻

13. Contributing

Pull requests welcome.
Please add unit tests for new features and ensure npm test passes.


⸻

© 2025 Anıl BÜRCÜ – All rights reserved.

```
