import { env } from "../../config/env.js";
import { kopecksToRublesString } from "../../utils/money.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GetPaymentResult,
  PaymentProvider,
} from "../payment-provider.interface.js";

const API_BASE = "https://api.yookassa.ru/v3";

function authHeader(): string {
  const token = Buffer.from(`${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`).toString("base64");
  return `Basic ${token}`;
}

interface YooKassaPaymentResponse {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  confirmation?: { confirmation_url?: string };
}

/**
 * Wraps a YooKassa fetch call so a network-level failure (DNS timeout,
 * connection refused, no route — this network simply can't reach
 * api.yookassa.ru) surfaces as the same clear AppError as a rejected
 * request, instead of an uncaught TypeError that falls through to a bare
 * "Internal server error".
 */
async function fetchYooKassa(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    console.error(`[yookassa] network error reaching ${url}:`, err);
    throw new AppError(
      "Не удалось связаться с платёжным сервисом. Проверьте подключение к интернету и попробуйте позже.",
      502,
      "PAYMENT_PROVIDER_UNREACHABLE",
    );
  }
}

export const yookassaProvider: PaymentProvider = {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const res = await fetchYooKassa(`${API_BASE}/payments`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        "Idempotence-Key": input.idempotenceKey,
      },
      body: JSON.stringify({
        // YooKassa's amount.value is a decimal string in RUBLES, not kopecks —
        // our DB and every other computation stay in kopecks; this is the only
        // place the conversion happens.
        amount: { value: kopecksToRublesString(input.amountKopecks), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: input.returnUrl },
        description: input.description,
        metadata: { orderNumber: input.orderNumber },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[yookassa] createPayment failed: ${res.status} ${body}`);
      throw new AppError("Платёжный сервис временно недоступен. Попробуйте позже.", 502, "PAYMENT_PROVIDER_ERROR");
    }

    const data = (await res.json()) as YooKassaPaymentResponse;
    if (!data.confirmation?.confirmation_url) {
      console.error("[yookassa] createPayment response missing confirmation_url", data);
      throw new AppError("Платёжный сервис временно недоступен. Попробуйте позже.", 502, "PAYMENT_PROVIDER_ERROR");
    }

    return { providerPaymentId: data.id, confirmationUrl: data.confirmation.confirmation_url };
  },

  async getPayment(providerPaymentId: string): Promise<GetPaymentResult> {
    const res = await fetchYooKassa(`${API_BASE}/payments/${providerPaymentId}`, {
      headers: { Authorization: authHeader() },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[yookassa] getPayment failed: ${res.status} ${body}`);
      throw new AppError("Не удалось проверить статус оплаты.", 502, "PAYMENT_PROVIDER_ERROR");
    }

    const data = (await res.json()) as YooKassaPaymentResponse;
    const status = data.status === "waiting_for_capture" ? "pending" : data.status;
    return { status, paid: data.paid };
  },
};
