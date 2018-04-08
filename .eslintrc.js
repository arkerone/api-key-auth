module.exports = {
  extends: 'airbnb-base',
  rules: {
    'comma-dangle': 'off',
    'max-len': ['error', 120],
    'no-restricted-syntax': 'off',
    'newline-per-chained-call': 'off',
    'no-param-reassign': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-console': 'off'
  },
  env: {
    mocha: true
  }
};
