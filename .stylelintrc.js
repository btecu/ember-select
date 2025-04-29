'use strict';

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
  rules: {
    // Remove once fixed
    'no-descending-specificity': null,
  },
};
