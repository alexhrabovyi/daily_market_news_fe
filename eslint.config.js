import { globalIgnores } from 'eslint/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'airbnb',
    'airbnb/hooks',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
    'next/core-web-vitals',
    'next/typescript',
  ),
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      'react/no-array-index-key': 'off',
      'react/jsx-props-no-spreading': 'off',
      'linebreak-style': [
        'error',
        'windows',
      ],
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'react/jsx-filename-extension': [
        1,
        {
          extensions: [
            '.tsx',
            '.jsx',
          ],
        },
      ],
      'react/require-default-props': 'off',
      'import/no-cycle': 'off',
      'no-nested-ternary': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'consistent-return': 'off',
      "linebreak-style": "off"
    },
  },
  globalIgnores([
    '.next',
    'node_modules',
    'jest.config.js',
    'eslint.config.js',
    'postcss.config.mjs'
  ]),
];

export default eslintConfig;
