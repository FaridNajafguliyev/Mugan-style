import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

const isConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

let transporter: Transporter | null = null;
let warnedUnconfigured = false;

function getTransporter(): Transporter | null {
  if (!isConfigured) {
    if (!warnedUnconfigured) {
      console.warn("[email] SMTP not configured — order confirmation emails are disabled");
      warnedUnconfigured = true;
    }
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

export interface OrderEmailItem {
  titleSnapshot: string;
  size: string;
  qty: number;
  priceKopecksSnapshot: number;
}

export interface OrderEmailData {
  orderNumber: string;
  contactName: string;
  totalKopecks: number;
  items: OrderEmailItem[];
  deliveryAddress: { city: string; street: string; house: string; apartment?: string | null };
}

function formatRubles(kopecks: number): string {
  return `${Math.round(kopecks / 100).toLocaleString("ru-RU")} ₽`;
}

// Customer-entered fields (name, address) land in this HTML verbatim —
// escaped so a name like "<b>" can't inject markup into the email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Fire-and-forget — a failed or unconfigured email must never block order
 * processing (payment confirmation, status changes), so callers should not
 * await this inline in a path whose success the customer depends on.
 */
export async function sendOrderConfirmationEmail(to: string, order: OrderEmailData): Promise<void> {
  const client = getTransporter();
  if (!client) return;

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escapeHtml(i.titleSnapshot)} · р. ${escapeHtml(i.size)} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${formatRubles(i.priceKopecksSnapshot * i.qty)}</td></tr>`,
    )
    .join("");

  const addr = order.deliveryAddress;
  const address = `${escapeHtml(addr.city)}, ${escapeHtml(addr.street)} ${escapeHtml(addr.house)}${addr.apartment ? `, кв. ${escapeHtml(addr.apartment)}` : ""}`;

  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#1a1a18">
      <h2 style="font-weight:500">Mugan Style</h2>
      <p>Здравствуйте, ${escapeHtml(order.contactName)}!</p>
      <p>Ваш заказ <strong>${order.orderNumber}</strong> подтверждён и принят в обработку.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">${itemsHtml}</table>
      <p style="font-size:18px"><strong>Итого: ${formatRubles(order.totalKopecks)}</strong></p>
      <p>Адрес доставки: ${address}</p>
      <p style="margin-top:24px;color:#8a7561;font-size:13px">
        Отследить статус заказа можно на странице
        <a href="${env.CLIENT_URL}/track-order">«Отследить заказ»</a> по номеру ${order.orderNumber}.
      </p>
    </div>
  `;

  try {
    await client.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `Заказ ${order.orderNumber} подтверждён — Mugan Style`,
      html,
    });
  } catch (err) {
    console.error(`[email] failed to send order confirmation for ${order.orderNumber}`, err);
  }
}
