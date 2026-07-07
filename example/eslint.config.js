import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';

import newWithError from 'eslint-plugin-new-with-error';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  ...tsPlugin.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  {
    plugins: {
      promise,
    },
    rules: {
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'off',
      'promise/no-callback-in-promise': 'warn',
      'promise/avoid-new': 'off',
      'promise/no-new-statics': 'error',
      'promise/no-return-in-finally': 'warn',
      'promise/valid-params': 'warn',
    },
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'new-with-error': newWithError,
      'unused-imports': unusedImports,
    },
    rules: {
      'max-len': [2, { code: 200, tabWidth: 2, ignoreComments: true, ignoreUrls: true }],
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'always'],
      'require-atomic-updates': 'off',
      'no-use-before-define': ['error', { functions: false, classes: false }],
      'no-multi-spaces': ['error'],
      'array-callback-return': ['error'],
      'block-scoped-var': ['error'],
      curly: ['error'],
      'no-throw-literal': ['error'],
      'guard-for-in': ['error'],
      'no-extend-native': ['error'],
      eqeqeq: ['error', 'always'],
      'no-extra-boolean-cast': 'off',
      'no-console': 'off',
      'no-useless-escape': 'off',

      'new-with-error/new-with-error': 'error',

      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '_', argsIgnorePattern: '_' }],
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'jest.config.js'],
  },
];
