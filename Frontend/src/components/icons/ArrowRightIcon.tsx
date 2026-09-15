type ArrowRightIconProps = {
  className?: string;
};

export function ArrowRightIcon({ className = "size-6" }: ArrowRightIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
