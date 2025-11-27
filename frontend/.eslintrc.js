module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off',
    '@next/next/no-img-element': 'off' // Permitir uso de img para imagens estáticas locais
  },
  ignorePatterns: [
    '.next',
    'node_modules',
    'dist',
    'build'
  ]
}
