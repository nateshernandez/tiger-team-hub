import js from "@eslint/js"
import eslintReact from "@eslint-react/eslint-plugin"
import pluginQuery from "@tanstack/eslint-plugin-query"
import pluginRouter from "@tanstack/eslint-plugin-router"
import boundaries from "eslint-plugin-boundaries"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unicorn from "eslint-plugin-unicorn"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

const BOOLEAN_PREFIXES = ["is", "has", "should", "can", "did", "will"]

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "src/app/route-tree.gen.ts",
    // shadcn output. Customize through wrappers, never by hand-editing.
    "src/components/ui",
  ]),

  // ---------------------------------------------------------------------------
  // Base: every TypeScript file
  // ---------------------------------------------------------------------------
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      unicorn,
    },
    rules: {
      // Control flow: flat and obvious
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-nested-ternary": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "object-shorthand": "error",
      "prefer-template": "error",

      // Named exports only (config files are exempted below)
      "no-restricted-exports": [
        "error",
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],

      // Imports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // TypeScript
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { requireDefaultForNonUnion: true },
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        { selector: "import", format: null },
        // Components are PascalCase; module constants may be UPPER_CASE.
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        {
          selector: "parameter",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        { selector: "typeLike", format: ["PascalCase"] },
        // Object keys often mirror external shapes (APIs, CSS, aria-*).
        { selector: ["objectLiteralProperty", "typeProperty"], format: null },
        { selector: "enumMember", format: ["PascalCase"] },
        // Booleans read as a yes/no question: isOpen, hasError, canSubmit.
        { selector: "variable", modifiers: ["destructured"], format: null },
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: BOOLEAN_PREFIXES,
        },
      ],

      // Files and names
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/name-replacements": [
        "error",
        {
          checkFilenames: false,
          allowList: {
            props: true,
            Props: true,
            ref: true,
            params: true,
            args: true,
            env: true,
            dev: true,
            prod: true,
          },
        },
      ],
      "unicorn/no-negated-condition": "error",
      "unicorn/no-useless-undefined": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-query-selector": "error",
      "unicorn/throw-new-error": "error",
    },
  },

  // ---------------------------------------------------------------------------
  // Exported functions in .ts modules state their return type, so reviewers
  // can read the contract without tracing the body.
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },

  // ---------------------------------------------------------------------------
  // React
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      eslintReact.configs["recommended-type-checked"],
      reactHooks.configs.flat["recommended-latest"],
      jsxA11y.flatConfigs.recommended,
      pluginQuery.configs["flat/recommended"],
      pluginRouter.configs["flat/recommended"],
    ],
  },

  // ---------------------------------------------------------------------------
  // Architecture: dependencies flow one way, shared -> features -> app.
  // Features never import from other features.
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      "boundaries/elements": [
        { type: "app", pattern: "src/app", partialMatch: false },
        {
          type: "feature",
          pattern: "src/features/*",
          capture: ["featureName"],
          partialMatch: false,
        },
        {
          type: "shared",
          pattern: ["src/components", "src/hooks", "src/lib", "src/types"],
          partialMatch: false,
        },
        { type: "test", pattern: "src/test", partialMatch: false },
      ],
    },
    rules: {
      "boundaries/no-unknown-files": "error",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "{{ from.element.types.[0] }} cannot import {{ to.element.types.[0] }}. Dependencies flow shared -> features -> app, and features never import other features.",
          policies: [
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "shared" } } },
            },
            {
              from: { element: { type: "feature" } },
              allow: [
                { to: { element: { type: "shared" } } },
                {
                  to: {
                    element: {
                      type: "feature",
                      captured: {
                        featureName: "{{from.element.captured.featureName}}",
                      },
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: "app" } },
              allow: {
                to: { element: { types: ["app", "feature", "shared"] } },
              },
            },
            {
              from: { element: { type: "test" } },
              allow: {
                to: {
                  element: { types: ["app", "feature", "shared", "test"] },
                },
              },
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // TanStack Router file routes are named by the router's conventions
  // (__root.tsx, $id.tsx) and export `Route`.
  // ---------------------------------------------------------------------------
  {
    files: ["src/app/routes/**/*.tsx"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // ---------------------------------------------------------------------------
  // Tool config files: default exports are the tools' convention.
  // ---------------------------------------------------------------------------
  {
    files: ["*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-restricted-exports": "off",
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
])
