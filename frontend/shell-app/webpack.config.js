const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  target: 'web',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shellApp',
      remotes: {
        sharedComponents: 'sharedComponents@http://localhost:3001/remoteEntry.js',
        dashboardMfe: 'dashboardMfe@http://localhost:3002/remoteEntry.js',
        tokenManagerMfe: 'tokenManagerMfe@http://localhost:3003/remoteEntry.js',
        authManagerMfe: 'authManagerMfe@http://localhost:3004/remoteEntry.js',
        apiDocsMfe: 'apiDocsMfe@http://localhost:3005/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.0.0',
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'JWT Generator - Admin Dashboard',
      favicon: './public/favicon.ico',
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    open: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/',
  },
};
