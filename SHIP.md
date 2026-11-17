# Ship checklist — TheWearCo

Env vars required on Vercel (Production):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | SQLite `file:./dev.db` for current deploy, or Postgres URL if you migrate |
| `SESSION_SECRET` | 32+ random chars — **different from local/dev** |
| `RESEND_API_KEY` | Needed for order emails + magic-link login |
| `MAIL_FROM` | e.g. `TheWearCo <orders@thewearco.com>` |
| `MAIL_REPLY_TO` | e.g. `hi@thewearco.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (no trailing slash) — used in magic links |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional. e.g. `thewearco.com` — enables cookie-less analytics |
| `RAZORPAY_KEY_ID` | Live key for production |
| `RAZORPAY_KEY_SECRET` | Live secret |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay dashboard webhook |

After deploy:

1. `npx prisma db push` (or run the SQL in `prisma/migrations/20261117120000_add_customer_auth/`) so `Customer` + `MagicLinkToken` exist.
2. Hit `/login` — create an account with email + password, then sign out and sign in again. Also try **Email OTP** (code is logged to the server console if `RESEND_API_KEY` is missing).
3. Place a guest COD/demo order, confirm the soft-prompt can set a password or send an OTP.
4. Confirm navbar shows the aurora initial pill when signed in.
