const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PAYHERO_BASE_URL = "https://backend.payhero.co.ke";
const PAYHERO_AUTH_HEADER =
  "Basic bW5HTzlzVUNRUDd4VDk0T3J4eVk6azlJWEE3cVNDanM3NlJKNzFIanhUaDhLbkxmQ3hwNEh1cFM0SzN1QQ==";

function parseBody(req: { body?: unknown }): Record<string, unknown> {
  const raw = req.body;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function mapPayheroStatus(rawStatus: string): "paid" | "failed" | "pending" {
  const status = rawStatus.toUpperCase();

  if (status === "SUCCESS" || status === "COMPLETED" || status === "PAID") {
    return "paid";
  }

  if (status === "FAILED" || status === "CANCELLED" || status === "CANCELED") {
    return "failed";
  }

  return "pending";
}

export default async function handler(req: any, res: any) {
  if (res.setHeader) {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  }

  if (req.method === "OPTIONS") {
    return res.status ? res.status(204).end() : new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return res.status
      ? res.status(405).json({ message: "Method not allowed" })
      : new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = parseBody(req);
    const reference =
      (typeof body.checkoutId === "string" ? body.checkoutId : undefined) ??
      (typeof body.checkoutRequestId === "string" ? body.checkoutRequestId : undefined) ??
      (typeof body.reference === "string" ? body.reference : undefined);

    if (!reference) {
      const errRes = { status: "error", message: "Missing checkoutId/reference" };
      return res.status ? res.status(400).json(errRes) : new Response(JSON.stringify(errRes), { status: 400 });
    }

    const payheroRes = await fetch(
      `${PAYHERO_BASE_URL}/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: PAYHERO_AUTH_HEADER,
        },
      },
    );

    const data = (await payheroRes.json().catch(() => null)) as Record<string, unknown> | null;

    if (!payheroRes.ok || !data) {
      const errRes = {
        status: "error",
        message:
          (typeof data?.error_message === "string" ? data.error_message : null) ??
          (typeof data?.message === "string" ? data.message : null) ??
          (typeof data?.error === "string" ? data.error : null) ??
          "Status check failed",
        raw: data,
      };
      return res.status
        ? res.status(payheroRes.status || 500).json(errRes)
        : new Response(JSON.stringify(errRes), { status: payheroRes.status || 500 });
    }

    const rawStatus = String(data.status ?? data.Status ?? "").trim();
    const mappedStatus = mapPayheroStatus(rawStatus);
    const success = data.success === true || mappedStatus === "paid";

    const successRes = {
      success,
      status: mappedStatus,
      state: mappedStatus === "paid" ? "success" : mappedStatus === "failed" ? "failed" : "pending",
      rawStatus,
      resultDesc:
        (typeof data.message === "string" ? data.message : "") ||
        (typeof data.resultDesc === "string" ? data.resultDesc : "") ||
        rawStatus,
      receiptNumber:
        (typeof data.provider_reference === "string" ? data.provider_reference : null) ??
        (typeof data.third_party_reference === "string" ? data.third_party_reference : null) ??
        (typeof data.payment_reference === "string" ? data.payment_reference : null),
      raw: data,
    };
    return res.status ? res.status(200).json(successRes) : new Response(JSON.stringify(successRes), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status check failed";
    const errRes = { status: "error", message };
    return res.status ? res.status(500).json(errRes) : new Response(JSON.stringify(errRes), { status: 500 });
  }
}
