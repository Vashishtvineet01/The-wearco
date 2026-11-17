import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Lazily-constructed Razorpay client. We don't instantiate at module load
 * so a missing key only fails the one request that actually needs the
 * gateway (e.g. the Vercel build step can still run without keys).
 */
let _client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (_client) return _client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay keys missing — set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET"
    );
  }
  _client = new Razorpay({ key_id, key_secret });
  return _client;
}

/**
 * True when the server has real Razorpay credentials configured.
 * The checkout UI falls back to a "demo mode — payment skipped" path when
 * this is false so local dev still works out of the box.
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

/** The public Razorpay key that we expose to the browser via the create-order
 *  response (never the secret!). */
export function publicRazorpayKey(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}

/**
 * Verify the signature Razorpay sends in the checkout success handler:
 * sha256_hmac(secret, razorpay_order_id|razorpay_payment_id)
 * Must match the value in `razorpay_signature`.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  // timingSafeEqual needs equal lengths or it throws.
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verify the signature on an incoming webhook event. Razorpay sends:
 *   X-Razorpay-Signature: hex(hmac_sha256(webhook_secret, raw_body))
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string | null;
}): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
