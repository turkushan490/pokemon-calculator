const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, '.webpack/renderer/main_window'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, '.webpack/renderer/main_window'),
        publicPath: '/',
        serveIndex: true,
        watch: true,
      },
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        watch: true,
      }
    ],
    devMiddleware: {
      writeToDisk: true,
    },
    compress: true,
    hot: true,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@workers': path.resolve(__dirname, 'src/workers'),
    }
  },
};
