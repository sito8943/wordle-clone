import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "convex/_generated"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/i18n/**",
      "src/**/constants.ts",
      "src/**/types.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXText[value=/[A-Za-zÀ-ÿ]/]",
          message:
            "Visible JSX text must come from i18n (`t(...)`) instead of literal strings.",
        },
        {
          selector:
            "JSXAttribute[name.name=/^(aria-label|title|placeholder|alt)$/][value.type='Literal'][value.value=/[A-Za-zÀ-ÿ]/]",
          message:
            "User-facing JSX attributes must use i18n (`t(...)`) instead of literal strings.",
        },
        {
          selector:
            "JSXExpressionContainer > Literal[value=/[A-Za-zÀ-ÿ]/]",
          message:
            "Visible JSX string literals must come from i18n (`t(...)`) instead of inline text.",
        },
      ],
    },
  },
]);
