export interface CreatePaymentInput {
  amountKopecks: number;
  description: string;
  orderNumber: string;
  returnUrl: string;
  idempotenceKey: string;
}

export interface CreatePaymentResult {
  providerPaymentId: string;
  confirmationUrl: string;
}

export interface GetPaymentResult {
  status: "pending" | "succeeded" | "canceled";
  paid: boolean;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPayment(providerPaymentId: string): Promise<GetPaymentResult>;
}
