const eslintTS = {
  files: ["*.ts", "*.tsx"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "sort-imports": [
      "error",
      {
        ignoreDeclarationSort: true,
      },
    ],
  },
};

const globalRules = {
  "block-scoped-var": "error",
  curly: ["error", "all"],
  "import/no-duplicates": ["error", { considerQueryString: false }],
  "import/order": [
    "error",
    {
      alphabetize: {
        order: "asc",
      },
      groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
      pathGroups: [
        {
          pattern: "@/**",
          group: "internal",
        },
      ],
      pathGroupsExcludedImportTypes: ["builtin"],
      "newlines-between": "always",
    },
  ],
  "no-alert": "error",
  "no-unused-vars": [
    "error",
    { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
  ],
  "react/jsx-curly-brace-presence": [
    "error",
    { props: "never", children: "never", propElementValues: "always" },
  ],
  "sort-imports": [
    "error",
    {
      ignoreDeclarationSort: true,
    },
  ],
};

module.exports = { eslintTS, globalRules };
