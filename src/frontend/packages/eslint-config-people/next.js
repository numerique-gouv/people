const common = require("./common");

module.exports = {
  extends: [
    "next",
    "plugin:prettier/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  settings: {
    "jsx-a11y": {
      polymorphicPropName: "as",
      components: {
        Input: "input",
        Button: "button",
        Box: "div",
        Text: "span",
        Select: "select",
      },
    },
  },
  rules: {
    ...common.globalRules,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
  },
  overrides: [
    common.eslintTS,
    {
      files: ["*.spec.*", "*.test.*", "**/__mock__/**/*"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended", "plugin:testing-library/react"],
      rules: {
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "testing-library/no-await-sync-events": [
          "error",
          { eventModules: ["fire-event"] },
        ],
        "testing-library/await-async-events": [
          "error",
          {
            eventModule: "userEvent",
          },
        ],
        "testing-library/no-manual-cleanup": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
        ],
        "react/display-name": 0,
        "jest/expect-expect": "error",
        "@typescript-eslint/unbound-method": "off",
        "jest/unbound-method": "error",
      },
    },
  ],
};
