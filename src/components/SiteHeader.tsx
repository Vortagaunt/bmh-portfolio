import Link from "next/link";
import { HelloHandwritingIcon, SparkleIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 h-16 w-full"
      style={{ mixBlendMode: "difference" }}
    >
      <div className="grid h-full grid-cols-3 items-center px-0 sm:grid-cols-[160px_1fr_160px]">
        {/* Logo */}
        <div className="flex items-center justify-start pl-5 sm:pl-8">
          <Link href="/" aria-label="Home" className="block w-[56px] text-white sm:w-[64px]">
            <HelloHandwritingIcon className="h-auto w-full" />
          </Link>
        </div>

        {/* Center nav — hidden on mobile to save space */}
        <nav className="hidden items-center justify-center gap-6 text-[14px] text-white sm:flex sm:gap-10 sm:text-[15px]">
          <Link href="#works" className="link-underline magnetic font-medium tracking-tight">
            (Works)
          </Link>
          <Link href="#about-me" className="link-underline magnetic font-medium tracking-tight">
            (About)
          </Link>
          <Link href="#about-me" className="link-underline magnetic font-medium tracking-tight">
            (Contact)
          </Link>
        </nav>

        {/* Mobile-only compact nav (center column on phones) */}
        <nav className="flex items-center justify-center gap-4 text-[13px] text-white sm:hidden">
          <Link href="#works" className="link-underline font-medium tracking-tight">
            (Works)
          </Link>
          <Link href="#about-me" className="link-underline font-medium tracking-tight">
            (About)
          </Link>
        </nav>

        {/* Right — Open to work (shortened on mobile) */}
        <div className="flex items-center justify-end gap-3 pr-5 text-[12px] text-white sm:gap-4 sm:pr-8 sm:text-[14px]">
          <span className="magnetic inline-flex items-center gap-1.5">
            <SparkleIcon className="h-3 w-3 transition-transform duration-700 hover:rotate-90 sm:h-3.5 sm:w-3.5" />
            <span className="font-medium tracking-tight">
              <span className="hidden sm:inline">Open to work</span>
              <span className="sm:hidden">Available</span>
            </span>
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
