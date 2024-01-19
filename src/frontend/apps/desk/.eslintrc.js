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
  ignorePatterns: ['.eslintrc.js'],
};
