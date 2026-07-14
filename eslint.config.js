const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const importPlugin = require('eslint-plugin-import');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'coverage/**',
      '**/*.test.{js,ts,jsx,tsx}',
      '**/*.spec.{js,ts,jsx,tsx}',
      'src/setupTests.ts',
      'src/test-utils.ts',
      'src/**/__tests__/**',
      'src/**/__mocks__/**'
    ]
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'react': react,
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'camelcase': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      'indent': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'eol-last': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'no-unused-vars': 'off',
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: '@mui/material',
            message: 'Use direct imports, for example @mui/material/Button, instead of barrel imports from @mui/material.'
          },
          {
            name: '@mui/icons-material',
            message: 'Use direct imports, for example @mui/icons-material/Add, instead of barrel imports from @mui/icons-material.'
          }
        ]
      }],
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@mui/**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: 'lodash/**',
            group: 'external',
            position: 'after'
          },
          {
            pattern: 'reactive-shared',
            group: 'external',
            position: 'after'
          },
          {
            pattern: 'yup',
            group: 'external',
            position: 'after'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin', 'react'],
        distinctGroup: true,
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }],
      'import/newline-after-import': ['error', { count: 1 }],

      // Import rules with proper regex patterns
      'import/no-cycle': ['error', {
        maxDepth: 10,
        ignoreExternal: true,
        ignore: [
          // Use proper regex patterns instead of glob patterns
          'node_modules',
          '\\.test\\.',
          '\\.spec\\.',
          'setupTests'
        ]
      }],
      'import/no-self-import': 'error',
    },
    settings: {
      'import/ignore': [
        'node_modules',
        '\\.(coffee|scss|css|less|hbs|svg|json)$',
        '\\.test\\.(js|jsx|ts|tsx)$',
        '\\.spec\\.(js|jsx|ts|tsx)$',
        'setupTests\\.(js|ts)$'
      ],
      react: {
        version: 'detect',
        runtime: 'automatic'
      },
    },
  },

  // Separate configuration for test files
  {
    files: [
      '**/*.test.{js,ts,jsx,tsx}',
      '**/*.spec.{js,ts,jsx,tsx}',
      'src/setupTests.ts',
      'src/test-utils.ts'
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node
      }
    },
    rules: {
      'import/no-cycle': 'off',
      'import/no-self-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off'
    }
  }
);
