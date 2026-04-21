import { createHmac, timingSafeEqual } from "node:crypto";

import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export const ACCESS_COOKIE_NAME = "fcc_access";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export interface AccessPayload {
  sessionId: string;
  email?: string;
  purchasedAt: string;
  expiresAt: string;
}

export function setupLemonSqueezy(apiKey?: string): boolean {
  if (!apiKey) {
    return false;
  }

  lemonSqueezySetup({ apiKey });
  return true;
}

function getSigningSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-development-secret-change-me";
}

export function createSignedAccessToken(payload: AccessPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", getSigningSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyAccessToken(token: string | undefined): AccessPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getSigningSecret()).update(encodedPayload).digest("base64url");

  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AccessPayload;

  if (!parsed.expiresAt || Number.isNaN(Date.parse(parsed.expiresAt))) {
    return null;
  }

  if (new Date(parsed.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return parsed;
}

export function verifyStripeSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) {
    return false;
  }

  const elements = signatureHeader.split(",");
  const timestampPart = elements.find((entry) => entry.startsWith("t="));
  const signaturePart = elements.find((entry) => entry.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.replace("t=", "").trim();
  const signature = signaturePart.replace("v1=", "").trim();

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
