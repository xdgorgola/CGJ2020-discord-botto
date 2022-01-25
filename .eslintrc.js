module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "max-len": [2, { code: 100, tabWidth: 2, ignoreUrls: true }],
  },
};
