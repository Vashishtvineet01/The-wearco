# Ship checklist — TheWearCo

Env vars required on Vercel (Production):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | SQLite `file:./dev.db` for current deploy, or Postgres URL if you migrate |
| `SESSION_SECRET` | 32+ random chars — **different from local/dev** |
| `RESEND_API_KEY` | Order confirmation emails |
| `MAIL_FROM` | e.g. `TheWearCo <orders@thewearco.com>` |
| `MAIL_REPLY_TO` | e.g. `hi@thewearco.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (no trailing slash) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional. e.g. `thewearco.com` — enables cookie-less analytics |
| `RAZORPAY_KEY_ID` | Live key for production |
| `RAZORPAY_KEY_SECRET` | Live secret |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay dashboard webhook |

### Phone OTP (SMS) — pick one provider, or leave unset for console stub

| Variable | Notes |
|---|---|
| `MSG91_AUTH_KEY` | MSG91 auth key |
| `MSG91_TEMPLATE_ID` | Required with MSG91 — OTP flow/template id |
| `MSG91_SENDER_ID` | Optional, default `TWRCO` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_FROM` | Twilio sender number (E.164) |

Priority: MSG91 (if key + template) → Twilio (if all three) → **console stub** (`[otp-sms] stub — OTP for +91…: 123456`).

After deploy:

1. `npx prisma db push` so `Customer.phone` + OTP token phone column exist.
2. Hit `/login` — **Phone OTP** is the default. Without SMS keys, read the code from the server/Vercel logs. Also try **Email & password**.
3. Place a guest COD/demo order, confirm the soft-prompt can **Text me a code** (uses checkout phone) or set a password.
4. Confirm navbar shows the aurora initial pill when signed in.
