import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  globalIgnores(['.next/**', 'node_modules/**', 'tsc/**']),
  ...nextCoreWebVitals,
  {
    rules: {
      'no-console': 'error',
      'react-hooks/set-state-in-effect': 'off'
    }
  }
])
