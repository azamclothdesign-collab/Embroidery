export const METHOD_CODES = ["payfast", "jazzcash", "easypaisa", "bank", "cod"] as const;
export type MethodCode = (typeof METHOD_CODES)[number];

export type FieldSpec = {
  key: string;
  label: string;
  /** Stored encrypted, never returned to the browser (only "is set"). */
  secret: boolean;
  required: boolean;
  /** Safe to show customers (bank account details). */
  public: boolean;
  help?: string;
};

export type MethodSpec = {
  code: MethodCode;
  kind: "gateway" | "manual";
  fields: FieldSpec[];
  /** Fixed, allow-listed provider endpoints. Admins cannot point these elsewhere. */
  endpoints?: { sandbox: Record<string, string>; live: Record<string, string> };
  callbackPaths?: string[];
};

const field = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key,
  label,
  secret: false,
  required: true,
  public: false,
  ...extra,
});

export const METHOD_SPECS: Record<MethodCode, MethodSpec> = {
  payfast: {
    code: "payfast",
    kind: "gateway",
    fields: [
      field("merchantId", "Merchant ID"),
      field("merchantName", "Merchant name", { help: "Your registered business / trading name" }),
      field("securedKey", "Secured key", { secret: true }),
    ],
    endpoints: {
      sandbox: {
        token: "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken",
        checkout: "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction",
      },
      live: {
        token: "https://ipg1.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken",
        checkout: "https://ipg1.apps.net.pk/Ecommerce/api/Transaction/PostTransaction",
      },
    },
    callbackPaths: ["/hooks/payfast/ipn", "/hooks/payfast/return"],
  },
  jazzcash: {
    code: "jazzcash",
    kind: "gateway",
    fields: [
      field("merchantId", "Merchant ID"),
      field("password", "Password", { secret: true }),
      field("integritySalt", "Integrity salt", { secret: true }),
    ],
    endpoints: {
      sandbox: {
        checkout: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
        inquiry: "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
      },
      live: {
        checkout: "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
        inquiry: "https://payments.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
      },
    },
    callbackPaths: ["/hooks/jazzcash/return"],
  },
  easypaisa: {
    code: "easypaisa",
    kind: "gateway",
    fields: [
      field("storeId", "Store ID"),
      field("hashKey", "Hash key", { secret: true, help: "16-character key from the Easypay merchant portal" }),
      field("accountNumber", "Merchant account number", { help: "Used to confirm payments with Easypaisa" }),
      field("apiUsername", "API username"),
      field("apiPassword", "API password", { secret: true }),
    ],
    endpoints: {
      sandbox: {
        index: "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf",
        confirm: "https://easypaystg.easypaisa.com.pk/easypay/Confirm.jsf",
        inquiry: "https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction",
      },
      live: {
        index: "https://easypay.easypaisa.com.pk/easypay/Index.jsf",
        confirm: "https://easypay.easypaisa.com.pk/easypay/Confirm.jsf",
        inquiry: "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction",
      },
    },
    callbackPaths: ["/hooks/easypaisa/return"],
  },
  bank: {
    code: "bank",
    kind: "manual",
    fields: [
      field("bankName", "Bank name", { public: true }),
      field("accountTitle", "Account title", { public: true }),
      field("accountNumber", "Account number", { public: true }),
      field("iban", "IBAN", { public: true, required: false }),
      field("branch", "Branch / code", { public: true, required: false }),
    ],
  },
  cod: { code: "cod", kind: "manual", fields: [] },
};

export function endpointsFor(code: MethodCode, mode: "sandbox" | "live"): Record<string, string> {
  const spec = METHOD_SPECS[code];
  if (spec.endpoints === undefined) return {};
  return spec.endpoints[mode];
}
