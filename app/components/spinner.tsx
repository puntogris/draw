export default function Spinner({ size = "md" }: { size: "sm" | "md" | "lg" }) {
  let dimen;

  switch (size) {
    case "sm":
      dimen = "h-6 w-6";
      break;
    case "md":
      dimen = "h-10 w-10";
      break;
    case "lg":
      dimen = "h-12 w-12";
      break;
  }

  return (
    <div
      className={`inline-block ${dimen} animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
