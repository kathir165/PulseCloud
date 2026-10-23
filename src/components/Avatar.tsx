export default function Avatar({
  src,
  name,
  className = "h-9 w-9",
  textClass = "text-sm",
}: {
  src: string | null;
  name: string;
  className?: string;
  textClass?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover ring-1 ring-line`} />;
  }
  return (
    <span
      className={`${className} ${textClass} flex shrink-0 items-center justify-center rounded-full bg-graphite-700 font-semibold text-accent ring-1 ring-line`}
    >
      {initials || (
        <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1-4 4-6 8-6s7 2 8 6" />
        </svg>
      )}
    </span>
  );
}