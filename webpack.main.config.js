const path = require('path');

module.exports = {
  entry: './src/main/index.ts',
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }]
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@workers': path.resolve(__dirname, 'src/workers'),
    }
  },
  output: {
    path: path.resolve(__dirname, '.webpack/main'),
    filename: 'index.js',
  },
};
