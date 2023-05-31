export default function Spinner({
  size = "md",
}: {
  size: "xs" | "sm" | "md" | "lg";
}) {
  let dimen;

  switch (size) {
    case "xs":
      dimen = "h-3 w-3 border-[1px]";
      break
    case "sm":
      dimen = "h-6 w-6 border-[3px]";
      break;
    case "md":
      dimen = "h-10 w-10 border-[3px]";
      break;
    case "lg":
      dimen = "h-12 w-12 border-[3px]";
      break;
  }

  return (
    <div
      className={`inline-block ${dimen} animate-spin rounded-full border-current border-t-transparent text-blue-600`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
