import Link from "next/link";
import { HelloHandwritingIcon, SparkleIcon } from "./icons";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 h-16 w-full"
      style={{ mixBlendMode: "difference" }}
    >
      <div className="grid h-full grid-cols-[160px_1fr_160px] items-center px-0">
        {/* Logo */}
        <div className="flex items-center justify-start pl-8">
          <Link href="/" aria-label="Home" className="block w-[64px] text-white">
            <HelloHandwritingIcon className="h-auto w-full" />
          </Link>
        </div>

        {/* Center nav */}
        <nav className="flex items-center justify-center gap-10 text-[15px] text-white">
          <Link href="#works" className="link-underline font-medium tracking-tight">
            (Works)
          </Link>
          <Link href="#about-me" className="link-underline font-medium tracking-tight">
            (About)
          </Link>
          <Link href="#about-me" className="link-underline font-medium tracking-tight">
            (Contact)
          </Link>
        </nav>

        {/* Right — Open to work */}
        <div className="flex items-center justify-end pr-8 text-[14px] text-white">
          <span className="inline-flex items-center gap-1.5">
            <SparkleIcon className="h-3.5 w-3.5" />
            <span className="font-medium tracking-tight">Open to work</span>
          </span>
        </div>
      </div>
    </header>
  );
}
