module.exports = {
  extends: 'airbnb-base',
  env: {
    mocha: true,
    node: true
  },
  rules: {
    'comma-dangle': 'off',
    'consistent-return': 'off',
    'max-len': ['error', 120],
    'newline-per-chained-call': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-expressions': 0
  }
};
