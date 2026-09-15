type HeartIconProps = {
  filled?: boolean;
};

export function HeartIcon({ filled = false }: HeartIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill={filled ? "currentColor" : "none"}
    >
      <path
        d="M12 20s-7-4.4-9.2-8.2C1 9.2 2.2 6 5.3 5.4 7.2 5 8.8 6 12 8.8 15.2 6 16.8 5 18.7 5.4 21.8 6 23 9.2 21.2 11.8 19 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
