function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export const apiRoutes = {
  health: "/health",
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    session: "/auth/session",
    changePassword: "/auth/change-password",
  },
  adminAuth: {
    login: "/admin/auth/login",
    logout: "/admin/auth/logout",
    session: "/admin/auth/session",
  },
  products: {
    list: "/products",
    details: (slug: string) => `/products/${encodePathSegment(slug)}`,
    create: "/products",
    update: (slug: string) => `/products/${encodePathSegment(slug)}`,
    delete: (slug: string) => `/products/${encodePathSegment(slug)}`,
  },
  categories: {
    list: "/categories",
    create: "/categories",
    update: (id: string) => `/categories/${encodePathSegment(id)}`,
    delete: (id: string) => `/categories/${encodePathSegment(id)}`,
  },
  cart: {
    get: "/cart",
    update: "/cart",
  },
  wishlist: {
    get: "/wishlist",
    update: "/wishlist",
  },
  orders: {
    list: "/orders",
    details: (orderId: string) => `/orders/${encodePathSegment(orderId)}`,
    create: "/orders",
    delete: (orderId: string) => `/orders/${encodePathSegment(orderId)}`,
    download: "/orders/download",
  },
  contact: {
    create: "/contact",
  },
  account: {
    settings: "/account/settings",
    downloads: "/account/downloads",
  },
  adminSite: {
    global: "/admin/site/global",
    home: "/admin/site/home",
    pages: "/admin/site/pages",
    faqs: "/admin/site/faqs",
  },
  adminMedia: {
    upload: "/admin/media/upload",
    package: "/admin/media/package",
  },
} as const;
