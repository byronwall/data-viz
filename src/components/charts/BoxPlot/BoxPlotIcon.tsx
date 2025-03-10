export function BoxPlotIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      viewBox="0 0 32 32"
      className={className}
    >
      <path
        fill="currentColor"
        d="M22 6V4H12v2h4v2h-4v12h4v2h-4v2h10v-2h-4v-2h4V8h-4V6Zm-8 12v-3h6v3Zm6-5h-6v-3h6Z"
      />
      <path fill="currentColor" d="M30 30H4a2 2 0 0 1-2-2V2h2v26h26Z" />
    </svg>
  );
}
