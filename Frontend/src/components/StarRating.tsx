type StarRatingProps = {
  value: number;
};

export function StarRating({ value }: StarRatingProps) {
  return (
    <p className="flex items-center gap-2 text-meta text-ink-soft">
      <span aria-hidden="true" className="tracking-[0.12em] text-accent">
        ★★★★★
      </span>
      <span className="sr-only">Rated {value} out of 5</span>
      <span>{value.toFixed(1)}</span>
    </p>
  );
}
