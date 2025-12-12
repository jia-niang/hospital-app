const {
  override,
  overrideDevServer,
  addBabelPlugins,
  addWebpackAlias,
  fixBabelImports,
  addWebpackModuleRule,
  addWebpackPlugin,
} = require('customize-cra')
const S3Plugin = require('webpack-s3-plugin')
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin')
const noop = require('lodash/identity')

module.exports = {
  webpack: override(
    addBabelPlugins(['@emotion']),

    addWebpackAlias({ '@': 'src/' }),

    fixBabelImports('mui-core', {
      libraryName: '@mui/core',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),

    fixBabelImports('mui-icon', {
      libraryName: '@mui/icon',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),

    fixBabelImports('mui-lab', {
      libraryName: '@mui/lab',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),

    fixBabelImports('lodash', {
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),

    addWebpackModuleRule({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    }),

    addWebpackPlugin(
      new HtmlWebpackTagsPlugin({
        usePublicPath: false,
        links: [
          { path: 'https://cdn.paperplane.cc', attributes: { rel: 'dns-prefetch' } },
          { path: 'https://cdn.paperplane.cc', attributes: { rel: 'preconnect' } },
        ],
      })
    ),

    process.env.NODE_ENV === 'production' && process.env.COS_SECRET_ID && process.env.COS_SECRET_KEY
      ? addWebpackPlugin(
          new S3Plugin({
            exclude: /.*\.html$/,
            basePath: 'paperplane-hospital',
            s3Options: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              endpoint: process.env.S3_ENDPOINT,
              apiVersion: '2006-03-01',
            },
            s3UploadOptions: {
              Bucket: process.env.S3_BUCKET_NAME,
            },
          })
        )
      : noop,

    process.env.NODE_ENV === 'production' && process.env.COS_SECRET_ID && process.env.COS_SECRET_KEY
      ? function setPublicPath(config) {
          config.output.publicPath = '//cdn.paperplane.cc/paperplane-hospital/'

          return config
        }
      : noop
  ),

  devServer: overrideDevServer(devServerConfig => ({
    ...devServerConfig,
    proxy: {
      '/api': {
        target: 'http://localhost:5505',
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  })),
}
