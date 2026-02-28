const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = __dirname;
const babelLoaderConfig = {
  test: /\.(ts|tsx|js|jsx)$/,
  exclude: /node_modules\/(?!(react-native-vector-icons|react-native-linear-gradient|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-paper|react-native-modal|react-native-toast-message|react-native-calendars|react-native-tab-view|react-native-pager-view|@react-navigation|@react-native-async-storage|react-native-svg)\/).*/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@react-native/babel-preset'],
      plugins: ['react-native-web'],
    },
  },
};

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    path: path.resolve(appDirectory, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web/dist/exports/View', // stub
      'react-native-maps': path.resolve(appDirectory, 'web/stubs/react-native-maps.js'),
      '@react-native-community/geolocation': path.resolve(appDirectory, 'web/stubs/geolocation.js'),
      '@react-native-community/blur': path.resolve(appDirectory, 'web/stubs/blur.js'),
      'react-native-sensors': path.resolve(appDirectory, 'web/stubs/sensors.js'),
      '@ptomasroos/react-native-multi-slider': path.resolve(appDirectory, 'web/stubs/multi-slider.js'),
    },
  },
  module: {
    rules: [
      babelLoaderConfig,
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'web/index.html'),
    }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: true,
  },
  mode: 'development',
  devtool: 'source-map',
};
