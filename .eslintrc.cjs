module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  ignorePatterns: ['dist', 'coverage', 'node_modules'],
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true },
    sourceType: 'module'
  },
  settings: { react: { version: '18.3' } },
  plugins: ['react', 'react-hooks', 'react-refresh', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 0,
    'react/display-name': 0,
    'react/react-in-jsx-scope': 0,

    'no-console': 1,
    'no-lonely-if': 1,
    'no-unused-vars': 1,
    'no-trailing-spaces': 1,
    'no-multi-spaces': 1,
    'no-multiple-empty-lines': 1,
    'space-before-blocks': ['error', 'always'],
    'object-curly-spacing': [1, 'always'],
    indent: ['warn', 2],
    semi: [1, 'never'],
    quotes: ['error', 'single'],
    'array-bracket-spacing': 1,
    'linebreak-style': 0,
    'no-unexpected-multiline': 'warn',
    'keyword-spacing': 1,
    'comma-dangle': 1,
    'comma-spacing': 1,
    'arrow-spacing': 1,

    'prettier/prettier': 'error'
  },
  overrides: [
    {
      files: [
        '**/*.test.{js,jsx}',
        'src/tests/**/*.{js,jsx}',
        'jest.config.cjs'
      ],
      env: { jest: true, node: true },
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'off'
      }
    }
  ]
}
