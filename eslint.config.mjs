import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude worktrees carry their own .next build output — never lint them.
    ".claude/**",
    // public/ is served verbatim, not compiled. The arcade cabinets vendor
    // third-party game engines in there (36 modules of 1996-era globals) —
    // our rules have nothing useful to say about them.
    "public/**",
  ]),
]);

export default eslintConfig;
