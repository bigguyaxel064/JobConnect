import js from '@eslint/js'; // JS rules ESlint
import react from 'eslint-plugin-react'; // React rules
import reactHooks from 'eslint-plugin-react-hooks'; // React hooks rules (useEffect etc)
import reactRefresh from 'eslint-plugin-react-refresh'; // Rules fast Refresh (when we change something, it changes without recharging page)
import unusedImports from 'eslint-plugin-unused-imports'; // To see import or var unused
import { defineConfig, globalIgnores } from 'eslint/config'; // Utility config ESlint
import globals from 'globals'; // global var (window, document...)

export default defineConfig([
  globalIgnores(['dist']), // Ignore folder dist
  {
    files: ['**/*.{js,jsx}'], // Apply on all files .js .jsx
    extends: [
      js.configs.recommended, // use JS rules recommended by ESLint
      reactHooks.configs['recommended-latest'], // use rules recommended by hooks react
      reactRefresh.configs.vite, // config for reactfast refresh with vite
    ],
    plugins: {
      react: react, // Activate plugin react
      'unused-imports': unusedImports, // Activate plugin to detect import unused
    },
    languageOptions: {
      ecmaVersion: 'latest', // Use latest version of ECMAScript available
      globals: globals.browser, // Add global var (window...)
      parserOptions: {
        ecmaFeatures: { jsx: true }, // Activate jsx syntax
        sourceType: 'module', // Tell we use modules ES6 (import, export)
      },
    },
    settings: {
      react: {
        version: 'detect', // auto detect version of react
      },
    },
    rules: {
      // Management var unused
      'no-unused-vars': 'off', // disable native rules (change to unused import
      'unused-imports/no-unused-imports': 'error', // error if import is unused
      'unused-imports/no-unused-vars': [
        // error for var
        'error',
        {
          vars: 'all', // check all var
          varsIgnorePattern: '^_', // Ignore var who begin with "_"
          args: 'after-used', // Check function parameter after the last used
          argsIgnorePattern: '^_', // Ignore params begin with _
        },
      ],

      // react rules
      'react/jsx-uses-vars': 'error', // Error if component is unused

      // hooks react unused
      'react-hooks/rules-of-hooks': 'error', // Error if hooks rules are not respected
      'react-hooks/exhaustive-deps': 'warn', // Warning if dependences are missing in useEffect

      // react fast refresh
      'react-refresh/only-export-components': 'warn', // Warning if export other than a component
    },
  },
]);
