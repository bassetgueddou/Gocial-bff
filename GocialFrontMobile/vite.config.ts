import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ---------------------------------------------------------------------------
// Plugin 1 – Stub react-native internal (Libraries/) imports
// ---------------------------------------------------------------------------
function reactNativeInternalsPlugin(): Plugin {
  return {
    name: 'react-native-internals-stub',
    enforce: 'pre',
    resolveId(source) {
      if (
        source.startsWith('react-native/Libraries/') ||
        source.startsWith('react-native-web/Libraries/')
      ) {
        return '\0rn-internals-stub';
      }
      return null;
    },
    load(id) {
      if (id === '\0rn-internals-stub') {
        return `
          const noop = () => {};
          const NoopComponent = () => null;
          export default NoopComponent;
          export const codegenNativeComponent = () => NoopComponent;
          export const codegenNativeCommands = () => ({});
          export const PressabilityDebugView = NoopComponent;
          export const get = noop;
          export const register = noop;
          export const customBubblingEventTypes = {};
          export const customDirectEventTypes = {};
          export const ReactFabric = {};
          export const ReactNative = {};
        `;
      }
      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin 2 – Strip Flow "import type" in .js (vector-icons etc.)
// ---------------------------------------------------------------------------
function flowStripPlugin(): Plugin {
  return {
    name: 'flow-strip-types',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules') && id.endsWith('.js') && code.includes('import type')) {
        return code.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '');
      }
      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin 3 – Transform require("...") → ESM import (images & other assets)
// React-Native projects use require() everywhere for local images.
// Vite is ESM-only, so we hoist them to static imports at compile time.
// ---------------------------------------------------------------------------
function requireToImportPlugin(): Plugin {
  return {
    name: 'require-to-import',
    enforce: 'pre',
    transform(code, id) {
      // Only process project source files, skip node_modules
      if (id.includes('node_modules') || !code.includes('require(')) return null;
      // Only process js/jsx/ts/tsx
      if (!/\.[jt]sx?$/.test(id)) return null;

      const requireRegex = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;
      let match: RegExpExecArray | null;
      const imports: Map<string, string> = new Map();
      let counter = 0;

      // Collect all unique require() paths
      while ((match = requireRegex.exec(code)) !== null) {
        const modulePath = match[1];
        if (!imports.has(modulePath)) {
          imports.set(modulePath, `__vite_require_${counter++}__`);
        }
      }

      if (imports.size === 0) return null;

      // Build import statements
      let header = '';
      for (const [modulePath, varName] of imports) {
        header += `import ${varName} from '${modulePath}';\n`;
      }

      // Replace all require("path") with the variable name
      let transformed = code.replace(requireRegex, (_full, modulePath) => {
        return imports.get(modulePath) || _full;
      });

      return { code: header + transformed, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    reactNativeInternalsPlugin(),
    flowStripPlugin(),
    requireToImportPlugin(),
    react({
      babel: {
        plugins: ['react-native-web'],
      },
    }),
  ],

  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react-native': 'react-native-web',
      'react-native-linear-gradient': path.resolve(__dirname, 'web/stubs/linear-gradient.jsx'),
      'react-native-maps': path.resolve(__dirname, 'web/stubs/react-native-maps.jsx'),
      '@react-native-community/geolocation': path.resolve(__dirname, 'web/stubs/geolocation.js'),
      '@react-native-community/blur': path.resolve(__dirname, 'web/stubs/blur.jsx'),
      'react-native-sensors': path.resolve(__dirname, 'web/stubs/sensors.js'),
      '@ptomasroos/react-native-multi-slider': path.resolve(__dirname, 'web/stubs/multi-slider.jsx'),
      '@react-native-community/datetimepicker': path.resolve(__dirname, 'web/stubs/datetimepicker.jsx'),
      '@react-native-community/slider': path.resolve(__dirname, 'web/stubs/slider.jsx'),
      'react-native-pager-view': path.resolve(__dirname, 'web/stubs/pager-view.jsx'),
    },
  },

  define: {
    __DEV__: JSON.stringify(true),
    global: 'globalThis',
    'process.env': '{}',
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
      resolveExtensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
    },
    include: [
      'react-native-web',
      '@react-navigation/native',
      '@react-navigation/stack',
      '@react-navigation/bottom-tabs',
      '@react-navigation/material-top-tabs',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-paper',
      'react-native-modal',
      'react-native-toast-message',
      'react-native-svg',
      'react-native-tab-view',
      'react-native-vector-icons',
      '@react-native-async-storage/async-storage',
      'warn-once',
      'axios',
    ],
    exclude: [],
  },

  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
