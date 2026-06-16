const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'scripts/'],
  },
  {
    rules: {
      // setState dentro de useEffect é um padrão legítimo para sincronizar
      // com sistemas externos (logout, data fetch). A regra é agressiva demais.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
