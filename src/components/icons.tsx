import type { SVGProps } from "react";

export function SparkleIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </g>
    </svg>
  );
}

export function HelloHandwritingIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  // Extracted from sahor.work — handwritten "hello" cursive
  return (
    <svg
      viewBox="0 0 267 97"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...props}
    >
      <path
        d="M 0 74.325 C 18.167 62.158 43.5 45.44 51.5 23.39 C 58.492 4.119 50.501 -5.108 42.5 2.873 C 31 14.344 32.5 56.886 29 84.825 C 30.167 70.194 35.5 46.045 54.5 46.825 C 71.5 47.523 51.613 80.809 65 84.825 C 91.667 92.825 117 45.325 98.5 45.325 C 84.5 45.325 69.5 80.959 98.5 84.825 C 132.25 89.325 157 8.325 139 8.325 C 124 8.325 109 81.325 136.5 83.325 C 173.618 86.025 194.5 11.325 177 9.325 C 159.5 7.325 147 83.5 173.5 83.5 C 194.155 83.5 192 63.386 212.5 48.386 C 204 51.386 184.012 77.95 209.5 85 C 234.425 88.012 239.5 45.325 219.5 46.825 C 207.025 47.761 221 72.825 257 49.325"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(5 5)"
      />
    </svg>
  );
}

export function FloretIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  // Quatrefoil flourish — used in footer "Bronx Hanratty ✤ (WIP 2019 - Present)"
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...props}
    >
      <path d="M8 0c0 2 1 3 3 3s3 1 3 3-1 3-3 3 3 1 3 3-1 3-3 3-3-1-3-3-1 3-3 3-3-1-3-3 1-3 3-3-3-1-3-3 1-3 3-3 3-1 3-3z" opacity="0.85" />
    </svg>
  );
}
