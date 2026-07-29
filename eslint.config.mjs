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
    // scripts/ isinya skrip Node biasa (CommonJS), bukan bagian aplikasi
    // Next.js. Aturan seperti larangan require() gak relevan di sana.
    "scripts/**",
  ]),
]);

export default eslintConfig;
