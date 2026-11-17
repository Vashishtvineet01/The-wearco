/**
 * SMS OTP delivery — MSG91 → Twilio → console stub.
 * Never throws for missing credentials in stub mode (dev-friendly).
 */

export type SmsResult = {
  provider: "msg91" | "twilio" | "stub";
};

export async function sendOtpSms(
  phoneE164: string,
  code: string
): Promise<SmsResult> {
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    await sendViaMsg91(phoneE164, code);
    return { provider: "msg91" };
  }
  if (process.env.MSG91_AUTH_KEY && !process.env.MSG91_TEMPLATE_ID) {
    console.warn(
      "[otp-sms] MSG91_AUTH_KEY set but MSG91_TEMPLATE_ID missing — falling through"
    );
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    await sendViaTwilio(phoneE164, code);
    return { provider: "twilio" };
  }

  console.info(`[otp-sms] stub — OTP for ${phoneE164}: ${code}`);
  return { provider: "stub" };
}

async function sendViaMsg91(phoneE164: string, code: string) {
  const authKey = process.env.MSG91_AUTH_KEY!;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || "TWRCO";
  // MSG91 expects digits without + for mobiles in many flows.
  const mobiles = phoneE164.replace(/^\+/, "");

  if (templateId) {
    // Flow / template API (recommended for OTP)
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        short_url: "0",
        recipients: [
          {
            mobiles,
            var: code,
            OTP: code,
          },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[otp-sms] MSG91 flow failed:", res.status, body);
      throw new Error("Could not send SMS. Try again in a moment.");
    }
    return;
  }

  // Fallback: simple sendotp-style endpoint
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", templateId || "");
  url.searchParams.set("mobile", mobiles);
  url.searchParams.set("otp", code);
  url.searchParams.set("otp_length", "6");
  url.searchParams.set("otp_expiry", "10");
  url.searchParams.set("sender", senderId);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { authkey: authKey, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[otp-sms] MSG91 otp failed:", res.status, body);
    throw new Error("Could not send SMS. Try again in a moment.");
  }
}

async function sendViaTwilio(phoneE164: string, code: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM!;
  const body = `Your TheWearCo code is ${code}. It expires in 10 minutes.`;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({
    To: phoneE164,
    From: from,
    Body: body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[otp-sms] Twilio failed:", res.status, text);
    throw new Error("Could not send SMS. Try again in a moment.");
  }
}
