const webpack = require('webpack')
const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const isDevelopment = !isProduction

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      index: './src/index.ts'
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'umd',
      library: 'reactive-shared',
      umdNamedDefine: true,
      globalObject: 'this'
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'process/browser': require.resolve('process/browser.js')
      },
      fallback: {
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "stream": require.resolve("stream-browserify"),
        "url": require.resolve("url"),
        "process": require.resolve("process/browser.js"),
        "stream-http": require.resolve("stream-http")
      },
      fullySpecified: false
    },
    externals: [
      // Function to externalize all MUI and other peer dependencies
      function ({ context, request }, callback) {
        // Externalize all @mui packages and their subpaths
        if (/^@mui\//.test(request)) {
          return callback(null, 'umd ' + request)
        }

        // Externalize emotion packages
        if (/^@emotion\//.test(request)) {
          return callback(null, 'umd ' + request)
        }

        // Externalize react packages
        if (/^react($|\/)|^react-dom($|\/)/.test(request)) {
          return callback(null, 'umd ' + request)
        }

        // Continue with other externals
        callback()
      },
      {
        // Core React
        react: {
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'react',
          root: 'React'
        },
        'react-dom': {
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'react-dom',
          root: 'ReactDOM'
        },

        // Other libraries
        yup: 'yup',
        lodash: 'lodash',
        '@fontsource/roboto': '@fontsource/roboto',
        'react-router-dom': 'react-router-dom',
        '@tanstack/react-query': '@tanstack/react-query',
        '@tanstack/react-query-devtools': '@tanstack/react-query-devtools',
        'react-hook-form': 'react-hook-form',
        '@hookform/resolvers': '@hookform/resolvers',
        'date-fns': 'date-fns',
        moment: 'moment',
        'moment-timezone': 'moment-timezone',
        'react-number-format': 'react-number-format',
        'react-infinite-scroll-component': 'react-infinite-scroll-component'
      }
    ],
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.ProgressPlugin(),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      }),
      ...(isDevelopment ? [new HtmlWebpackPlugin({
        template: 'public/index.html'
      })] : []),
      ...(env && env.analyze ? [new BundleAnalyzerPlugin()] : []),
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: true,
        allowAsyncCycles: false,
        cwd: process.cwd(),
      })
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    targets: {
                      browsers: ['last 2 versions', 'not dead', 'not ie <= 11']
                    }
                  }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                  '@babel/preset-typescript'
                ]
              }
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                compilerOptions: {
                  noEmit: false
                }
              }
            }
          ]
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['last 2 versions', 'not dead', 'not ie <= 11']
                  }
                }],
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource'
        }
      ]
    },
    optimization: {
      minimize: isProduction,
      splitChunks: false
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxAssetSize: 500000,
      maxEntrypointSize: 500000
    }
  }
}