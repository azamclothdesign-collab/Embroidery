import { createHash, createHmac, randomBytes } from "node:crypto";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const secret =
  process.env.HMAC_SIGNING_SECRET ?? "localDevelopmentSecretAtLeast32Chars";
const origin = process.env.ORIGIN ?? "http://localhost:3000";

function sign(method, path, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString("hex");
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const canonical = `${method}${path}${timestamp}${nonce}${bodyHash}`;
  const signature = createHmac("sha256", secret).update(canonical).digest("hex");
  return {
    "content-type": "application/json",
    origin,
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-body-hash": bodyHash,
    "x-signature": signature,
  };
}

async function request(method, path, options = {}) {
  const body = options.body === undefined ? "" : JSON.stringify(options.body);
  const headers = {
    ...sign(method, path, body),
    ...(options.headers ?? {}),
  };

  if (options.skipHmac) {
    delete headers["x-timestamp"];
    delete headers["x-nonce"];
    delete headers["x-body-hash"];
    delete headers["x-signature"];
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text.length === 0 ? null : JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: response.status, json, headers: response.headers };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function run() {
  // Health (no HMAC)
  {
    const res = await fetch(`${baseUrl}/health`);
    const json = await res.json();
    record(
      "GET /health",
      res.status === 200 && json?.data?.status === "ok",
      `status=${res.status}`,
    );
  }

  // Products without HMAC should fail
  {
    const res = await request("GET", "/products", { skipHmac: true });
    record(
      "GET /products without HMAC",
      res.status === 401,
      `status=${res.status}`,
    );
  }

  // Products list
  let products = [];
  {
    const res = await request("GET", "/products");
    products = res.json?.data?.products ?? [];
    record(
      "GET /products",
      res.status === 200 && products.length === 19,
      `count=${products.length}`,
    );
  }

  // Product details
  {
    const res = await request("GET", "/products/design-one");
    record(
      "GET /products/design-one",
      res.status === 200 && res.json?.data?.product?.slug === "design-one",
      `status=${res.status}`,
    );
  }

  // Missing product
  {
    const res = await request("GET", "/products/does-not-exist");
    record(
      "GET /products/missing",
      res.status === 404,
      `status=${res.status}`,
    );
  }

  // Categories
  {
    const res = await request("GET", "/categories");
    const categories = res.json?.data?.categories ?? [];
    record(
      "GET /categories",
      res.status === 200 && categories.length === 25,
      `count=${categories.length}`,
    );
  }

  // Admin login invalid
  {
    const res = await request("POST", "/admin/auth/login", {
      body: { email: "admin@example.com", password: "wrong-password" },
    });
    record(
      "POST /admin/auth/login invalid",
      res.status === 401 || res.status === 422 || res.status === 400,
      `status=${res.status}`,
    );
  }

  // Admin login valid
  let adminSession = "";
  {
    const res = await request("POST", "/admin/auth/login", {
      body: { email: "admin@example.com", password: "admin123" },
    });
    adminSession =
      res.json?.data?.sessionToken ??
      res.json?.data?.token ??
      res.headers.get("x-admin-session") ??
      "";
    // Also check Set-Cookie style in body
    if (!adminSession && res.json?.data) {
      adminSession =
        res.json.data.adminSessionToken ??
        res.json.data.session?.token ??
        "";
    }
    record(
      "POST /admin/auth/login",
      res.status === 200 || res.status === 201,
      `status=${res.status} bodyKeys=${Object.keys(res.json?.data ?? {}).join(",")}`,
    );
  }

  // Customer register
  const email = `audit-${Date.now()}@example.com`;
  let customerSession = "";
  {
    const res = await request("POST", "/auth/register", {
      body: {
        email,
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        firstName: "Audit",
        lastName: "User",
      },
    });
    customerSession =
      res.json?.data?.sessionToken ??
      res.json?.data?.token ??
      "";
    if (!customerSession && res.json?.data) {
      customerSession =
        res.json.data.customerSessionToken ??
        res.json.data.session?.token ??
        "";
    }
    record(
      "POST /auth/register",
      res.status === 200 || res.status === 201,
      `status=${res.status} keys=${Object.keys(res.json?.data ?? {}).join(",")}`,
    );
  }

  // Duplicate register
  {
    const res = await request("POST", "/auth/register", {
      body: {
        email,
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        firstName: "Audit",
        lastName: "User",
      },
    });
    record(
      "POST /auth/register duplicate",
      res.status === 409 || res.status === 422 || res.status === 400,
      `status=${res.status}`,
    );
  }

  // Guest cart via guest token
  const guestToken = randomBytes(16).toString("hex");
  {
    const slug = products[0]?.slug ?? "design-one";
    const res = await request("PUT", "/cart", {
      headers: { "x-guest-token": guestToken },
      body: {
        lines: [
          {
            slug,
            pdpSlug: products[0]?.pdpSlug ?? slug,
            name: products[0]?.name ?? "Design One",
            priceCents: 1,
            imageSrc: products[0]?.imageSrc ?? "/x.webp",
            imageAlt: "x",
          },
        ],
      },
    });
    const lines = res.json?.data?.lines ?? [];
    const price = lines[0]?.priceCents;
    record(
      "PUT /cart guest (price from DB)",
      (res.status === 200 || res.status === 201) && price === 499,
      `status=${res.status} price=${price}`,
    );
  }

  {
    const res = await request("GET", "/cart", {
      headers: { "x-guest-token": guestToken },
    });
    const lines = res.json?.data?.lines ?? [];
    record(
      "GET /cart guest",
      res.status === 200 && lines.length === 1,
      `status=${res.status} lines=${lines.length}`,
    );
  }

  // Order create should use DB prices
  {
    const slug = products[0]?.slug ?? "design-one";
    const res = await request("POST", "/orders", {
      headers: {
        "x-guest-token": guestToken,
        ...(customerSession ? { "x-customer-session": customerSession } : {}),
      },
      body: {
        email,
        totalCents: 499,
        discountCents: 0,
        lines: [
          {
            slug,
            pdpSlug: products[0]?.pdpSlug ?? slug,
            name: "Hacked Name",
            priceCents: 1,
            imageSrc: "/x.webp",
            imageAlt: "x",
          },
        ],
      },
    });
    const order = res.json?.data?.order;
    record(
      "POST /orders (trusted price)",
      (res.status === 200 || res.status === 201) &&
        order?.totalCents === 499 &&
        order?.lines?.[0]?.priceCents === 499,
      `status=${res.status} total=${order?.totalCents} linePrice=${order?.lines?.[0]?.priceCents}`,
    );
  }

  // Order total mismatch rejected
  {
    const slug = products[0]?.slug ?? "design-one";
    const res = await request("POST", "/orders", {
      headers: { "x-guest-token": guestToken },
      body: {
        email,
        totalCents: 1,
        discountCents: 0,
        lines: [
          {
            slug,
            pdpSlug: slug,
            name: "x",
            priceCents: 1,
            imageSrc: "/x.webp",
            imageAlt: "x",
          },
        ],
      },
    });
    record(
      "POST /orders total mismatch",
      res.status === 422,
      `status=${res.status}`,
    );
  }

  // Admin products create unauthorized
  {
    const res = await request("POST", "/products", {
      body: {
        slug: "hack-product",
        pdpSlug: "hack-product",
        name: "Hack",
        categoryId: "motif-embroidery",
        rating: 5,
        priceCents: 100,
        hoopSize: '4 × 4"',
        stitchCount: 1000,
        badge: "New",
        imageSrc: "/x.webp",
        imageAlt: "x",
        formats: ["PES"],
      },
    });
    record(
      "POST /products without admin",
      res.status === 401 || res.status === 403,
      `status=${res.status}`,
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- summary ---");
  console.log(`passed=${results.length - failed.length} failed=${failed.length}`);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
