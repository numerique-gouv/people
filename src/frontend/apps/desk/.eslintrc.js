module.exports = {
  root: true,
  extends: ['people/next'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  settings: {
    next: {
      rootDir: __dirname,
    },
  },
  ignorePatterns: ['node_modules', '.eslintrc.js'],
};
