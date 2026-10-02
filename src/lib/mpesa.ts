import { toast } from "sonner";

export class MpesaService {
  static formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.substring(1);
    if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
    if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
    return cleaned;
  }

  static async initiateSTKPush(
    phoneNumber: string,
    amount: number = 10,
    accountReference: string = "DOMAIN-RENEW",
    transactionDesc: string = "Domain Renewal Fee"
  ): Promise<{ success: boolean; checkoutRequestId?: string; error?: string }> {
    try {
      const formattedPhone = this.formatPhone(phoneNumber);

      const response = await fetch("/api/payhero/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          phoneNumber: phoneNumber,
          phone_number: formattedPhone,
          amount,
          description: transactionDesc,
          reference: accountReference,
          referencePrefix: "DOMAIN",
        }),
      });

      let data: Record<string, unknown> | null = null;
      try {
        data = (await response.json()) as Record<string, unknown>;
      } catch {
        return {
          success: false,
          error: `Payment service returned an invalid response (${response.status}).`,
        };
      }

      const checkoutRequestId =
        (typeof data?.checkoutId === "string" ? data.checkoutId : null) ??
        (typeof data?.checkoutRequestId === "string" ? data.checkoutRequestId : null);

      if (!response.ok || data?.success === false || !checkoutRequestId) {
        const errorMessage =
          (typeof data?.message === "string" ? data.message : null) ??
          (typeof data?.error === "string" ? data.error : null) ??
          `Failed to initiate payment (${response.status})`;
        return { success: false, error: errorMessage };
      }

      toast.success("STK Push sent! Check your phone and enter M-Pesa PIN.");
      return { success: true, checkoutRequestId };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to initiate payment",
      };
    }
  }

  static async pollPaymentStatus(
    checkoutRequestId: string,
    onComplete: () => void,
    onFailed: (errorMsg?: string) => void,
    maxAttempts: number = 15
  ) {
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        onFailed("Payment confirmation timed out. Please check your M-Pesa SMS.");
        return;
      }

      attempts++;

      try {
        const response = await fetch("/api/payhero/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutId: checkoutRequestId }),
        });

        const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

        if (!response.ok || !data || data.status === "error") {
          setTimeout(checkStatus, 4000);
          return;
        }

        const responseStatus = String(data.status ?? data.state ?? "").toLowerCase();
        const rawStatus = String(data.rawStatus ?? "").toLowerCase();
        const resultDesc =
          (typeof data.resultDesc === "string" ? data.resultDesc : "") ||
          (typeof data.message === "string" ? data.message : "");

        const paid =
          responseStatus === "paid" ||
          responseStatus === "success" ||
          rawStatus === "success" ||
          rawStatus === "completed" ||
          rawStatus === "paid";

        const failed =
          responseStatus === "failed" ||
          rawStatus === "failed" ||
          rawStatus === "cancelled" ||
          rawStatus === "canceled";

        if (paid) {
          toast.success("Payment confirmed!");
          onComplete();
          return;
        }

        if (failed) {
          toast.error(resultDesc || "Payment was cancelled or failed");
          onFailed(resultDesc || "Payment failed");
          return;
        }

        setTimeout(checkStatus, 4000);
      } catch {
        setTimeout(checkStatus, 4000);
      }
    };

    setTimeout(checkStatus, 3000);
  }
}
