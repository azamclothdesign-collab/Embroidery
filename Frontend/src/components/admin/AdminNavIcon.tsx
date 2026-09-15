type AdminNavIconProps = {
  id: "overview" | "products" | "categories" | "orders" | "site" | "settings" | "security";
  className?: string;
};

export function AdminNavIcon({ id, className = "size-5" }: AdminNavIconProps) {
  const common = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    fill: "none",
    className,
  };

  if (id === "overview") {
    return (
      <svg {...common}>
        <rect
          x="3.5"
          y="3.5"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="13.5"
          y="3.5"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="3.5"
          y="13.5"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="13.5"
          y="13.5"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (id === "products") {
    return (
      <svg {...common}>
        <path
          d="M4.5 8.5 12 4.5l7.5 4v7l-7.5 4-7.5-4v-7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 12.5v7M12 12.5 4.5 8.5M12 12.5l7.5-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "orders") {
    return (
      <svg {...common}>
        <path
          d="M7 7h10v12.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 7V5.5a3 3 0 0 1 6 0V7"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M9.5 12h5M9.5 15.5h3.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (id === "site") {
    return (
      <svg {...common}>
        <rect
          x="3.5"
          y="4.5"
          width="17"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M3.5 9h17M8 9v10.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M12 3.75 13.8 8.4l5 .4-3.8 3.3 1.2 4.8L12 14.7 7.8 16.9l1.2-4.8-3.8-3.3 5-.4L12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
