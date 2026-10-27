import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      "node_modules",
      "public/mockServiceWorker.js",
      "src/api/schema.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...pluginQuery.configs["flat/recommended"],
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.js"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      // El cliente del Sandbox es un servicio estable inyectado, no un
      // parámetro de la consulta: no forma parte de la queryKey.
      "@tanstack/query/exhaustive-deps": [
        "error",
        { allowlist: { variables: ["api"] } },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            "Prohibido dangerouslySetInnerHTML: pinta los datos como texto.",
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "localStorage",
          message: "No guardes tokens ni datos de sesión en localStorage.",
        },
        {
          object: "sessionStorage",
          message: "No guardes tokens ni datos de sesión en sessionStorage.",
        },
      ],
    },
  },
  {
    files: ["tests/**", "mocks/**", "*.config.ts", "eslint.config.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "react-refresh/only-export-components": "off",
      "no-restricted-properties": "off",
    },
  },
);
