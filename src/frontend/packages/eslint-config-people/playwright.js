const common = require("./common");

module.exports = {
  extends: ["next", "plugin:prettier/recommended"],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  rules: common.globalRules,
  overrides: [
    common.eslintTS,
    {
      files: ["*.spec.*", "*.test.*", "**/__mock__/**/*"],
      extends: ["plugin:playwright/recommended"],
      plugins: ["playwright"],
    },
  ],
};
