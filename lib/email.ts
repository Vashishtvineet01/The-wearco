import { Resend } from "resend";
import type { Order, OrderItem } from "@prisma/client";

/**
 * Lazy Resend client. Mirrors the razorpay client — a missing key only
 * fails the specific call-site, so local dev without RESEND_API_KEY still
 * works (email calls just log instead of sending).
 */
let _client: Resend | null = null;
function getResend(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.MAIL_FROM || "TheWearCo <orders@thewearco.com>";
const REPLY_TO = process.env.MAIL_REPLY_TO || "hi@thewearco.com";

type OrderWithItems = Order & { items: OrderItem[] };

/** Rupees → "₹1,299" (no decimals). */
function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Fire-and-forget order confirmation email. Never throws upstream — a
 * failing mail provider shouldn't 500 the order API.
 */
export async function sendOrderConfirmationEmail(
  order: OrderWithItems
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.info(
      `[email] RESEND_API_KEY not set — would have sent confirmation for ${order.orderNumber}`
    );
    return;
  }

  const addr = (() => {
    try {
      return JSON.parse(order.address) as {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
      };
    } catch {
      return {};
    }
  })();

  const trackUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://the-wearco.vercel.app"
  }/track?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.email)}`;

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e4d9;">
          <div style="font-weight:600;color:#0f0d0a;">${escapeHtml(i.name)}</div>
          <div style="color:#6b6859;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
            ${escapeHtml(i.size)} · ${escapeHtml(i.color)} · × ${i.qty}
          </div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e4d9;text-align:right;font-family:ui-monospace,monospace;color:#2a281e;">
          ${inr(i.price * i.qty)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0d0a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#4a6b00;font-family:ui-monospace,monospace;">
        // Order confirmed
      </div>
      <h1 style="margin:12px 0 4px;font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-0.5px;">
        You're shipping, ${escapeHtml(order.name.split(" ")[0] || "friend")}.
      </h1>
      <p style="margin:0 0 24px;color:#4a4737;font-size:15px;line-height:1.5;">
        We've received order <strong>${order.orderNumber}</strong>${
          order.paymentStatus === "paid"
            ? " and your payment cleared"
            : order.paymentMethod === "cod"
              ? " — you'll pay on delivery"
              : ""
        }. Custom prints ship in 5–7 working days, drops in 2–4.
      </p>

      <div style="border:1px solid #e5e4d9;border-radius:16px;padding:20px;background:#fff;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#6b6859;font-family:ui-monospace,monospace;margin-bottom:10px;">
          Items
        </div>
        <table width="100%" style="border-collapse:collapse;">${itemRows}</table>
        <table width="100%" style="margin-top:16px;border-collapse:collapse;font-size:14px;color:#4a4737;">
          <tr><td>Subtotal</td><td style="text-align:right;font-family:ui-monospace,monospace;">${inr(order.subtotal)}</td></tr>
          <tr><td>Shipping</td><td style="text-align:right;font-family:ui-monospace,monospace;">${
            order.shipping === 0 ? "Free" : inr(order.shipping)
          }</td></tr>
          <tr><td style="padding-top:10px;border-top:1px solid #e5e4d9;font-size:16px;font-weight:700;color:#0f0d0a;">Total</td><td style="padding-top:10px;border-top:1px solid #e5e4d9;text-align:right;font-family:ui-monospace,monospace;font-size:18px;font-weight:700;color:#0f0d0a;">${inr(order.total)}</td></tr>
        </table>
      </div>

      <div style="margin-top:24px;border:1px solid #e5e4d9;border-radius:16px;padding:20px;background:#fff;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#6b6859;font-family:ui-monospace,monospace;margin-bottom:10px;">
          Ship to
        </div>
        <div style="color:#2a281e;line-height:1.5;">
          <div style="font-weight:600;">${escapeHtml(order.name)}</div>
          <div>${escapeHtml(addr.line1 || "")}${addr.line2 ? ", " + escapeHtml(addr.line2) : ""}</div>
          <div>${escapeHtml(addr.city || "")}, ${escapeHtml(addr.state || "")} ${escapeHtml(addr.pincode || "")}</div>
          <div>${escapeHtml(addr.country || "India")}</div>
          <div style="margin-top:6px;color:#6b6859;font-size:13px;">${escapeHtml(order.phone)}</div>
        </div>
      </div>

      <div style="margin-top:28px;text-align:center;">
        <a href="${trackUrl}" style="display:inline-block;padding:14px 22px;background:#0f0d0a;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">
          Track your order →
        </a>
      </div>

      <p style="margin-top:32px;font-size:12px;color:#6b6859;line-height:1.5;text-align:center;">
        Questions? Reply to this email or write to
        <a href="mailto:${REPLY_TO}" style="color:#4a2bff;">${REPLY_TO}</a>.<br/>
        TheWearCo · Internet uniform for founders & creators.
      </p>
    </div>
  </body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      replyTo: REPLY_TO,
      subject: `Order confirmed · ${order.orderNumber}`,
      html,
    });
  } catch (e) {
    // Never bubble — the order itself is already saved.
    console.error("[email] send failed:", e);
  }
}

/** Minimal HTML escape so user-supplied strings can't break the template. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
