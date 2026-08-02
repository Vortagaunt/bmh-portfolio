import { cn } from "@/lib/utils";

export function GridBackdrop({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  // "dark" means a permanently dark room (the vault), so it stays pinned.
  // "light" means over paper, which flips with the theme — hence the token.
  const lineColor = variant === "dark" ? "var(--grid-dark)" : "var(--grid)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `
          linear-gradient(to right, ${lineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: "calc((100% - 320px) / 5) 100%, 100% 100%",
        backgroundPosition: "160px 0, 0 0",
      }}
    />
  );
}
