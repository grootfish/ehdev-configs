const glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.getHTML = (cwd) => glob.sync('*.html', {
  cwd,
});

/**
 * 样式和图片配置
 * 开发环境：使用 style loader 注入页面
 * 生产环境：使用 ExtractTextPlugin 抽成独立 css 文件
 */
exports.getStyleWithImageLoaderConfig = (IS_DEV, BROWSER_SUPPORTS, PUBLIC_PATH) => {
  const CommonStyleLoader = [
    {
      loader: 'css-loader',
      options: {
        minimize: !IS_DEV,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins() {
          return [
            require('autoprefixer')({
              browsers: BROWSER_SUPPORTS,
            }),
          ];
        }
      },
    },
    'less-loader',
  ];
  let StyleLoaderConfig;
  let ImageLoaderConfig;
  let ExtractCssPlugin;
  if (IS_DEV) {
    StyleLoaderConfig = [
      'style-loader',
      ...CommonStyleLoader
    ];
    // 开发环境 图片不做处理
    ImageLoaderConfig = [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/',
          publicPath: '/assets/',
        },
      },
    ];
  } else {
    StyleLoaderConfig = ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: CommonStyleLoader,
    });
    ExtractCssPlugin = new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css',
    });
    // 生产环境 图片需要优化
    ImageLoaderConfig = [
      {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[hash:8].[ext]',
          outputPath: 'assets/',
          publicPath: PUBLIC_PATH,
        },
      },
      {
        loader: 'image-webpack-loader',
        query: {
          progressive: true,
          optipng: {
            optimizationLevel: 3,
          },
          gifsicle: {
            interlaced: true,
          },
          pngquant: {
            quality: '65-80',
            speed: 5
          }
        }
      },
    ];
  }
  return {
    StyleLoaderConfig: {
      test: /\.(le|c)ss$/,
      use: StyleLoaderConfig,
    },
    ImageLoaderConfig: {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: ImageLoaderConfig,
    },
    ExtractCssPlugin,
  }
}