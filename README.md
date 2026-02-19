# CareLine360-WebApp-MERN
Health helpline - A web application for remote consultation &amp; emergency help in remote regions.

<!-- http://localhost:6000 -->

Here’s a clean **README section** you can paste into `README_AUTH.md` (or main README) so your teammates can use **Email Verification + Forgot Password** instantly.

---

# 📧 Email Verification (OTP)

## Purpose

Verifies a user’s email using a **6-digit OTP** (expires in **10 minutes**).
OTP is stored as a **hash** in DB (not plain text).

## Endpoints

### 1) Send Verification OTP

**POST** `/api/auth/email/send-verify-otp`

Body:

```json
{
  "identifier": "user@gmail.com"
}
```

Success:

```json
{
  "message": "Verification OTP sent to email"
}
```

Notes:

* `identifier` can be email/phone, but email must exist in account.
* If already verified: returns `"Email already verified"`.

---

### 2) Verify Email OTP

**POST** `/api/auth/email/verify-otp`

Body:

```json
{
  "identifier": "user@gmail.com",
  "otp": "123456"
}
```

Success:

```json
{
  "message": "Email verified successfully"
}
```

After success:

* `users.isVerified` becomes `true`
* OTP record is deleted.

---

# 🔒 Forgot Password (OTP)

## Purpose

Allows user to reset password using **OTP sent to email**.
On successful reset, the system clears `refreshTokenHash` to **logout all devices**.

## Endpoints

### 1) Send Password Reset OTP

**POST** `/api/auth/password/forgot`

Body:

```json
{
  "identifier": "user@gmail.com"
}
```

Success:

```json
{
  "message": "Password reset OTP sent to email"
}
```

---

### 2) Reset Password using OTP

**POST** `/api/auth/password/reset`

Body:

```json
{
  "identifier": "user@gmail.com",
  "otp": "123456",
  "newPassword": "NewPass@1234"
}
```

Success:

```json
{
  "message": "Password reset successful. Please login again."
}
```

Password rules:

* Min 8 chars
* Must include uppercase
* Must include number
* Must include special character

Security:

* OTP expires in 10 minutes
* Max attempts: 5

---

# ⚙️ Email Setup (SMTP)

Add to `.env` (DO NOT commit `.env`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=CareLine360 <yourgmail@gmail.com>
```

✅ Gmail requires **2FA + App Password** (normal password will not work).

---

# 🧪 Postman Quick Test Flow

1. Register user
2. Send verify OTP → check email
3. Verify OTP
4. Forgot password → check email
5. Reset password
6. Login with new password
7. Try old refresh token → should fail (`Invalid refresh token`)

---
