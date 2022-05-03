const webpack = require('webpack');
const withSass = require('@zeit/next-sass');
const withGraphql = require('next-plugin-graphql');
const withImages = require('next-images');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');

// Silence mini-css-extract-plugin generating lots of warnings for CSS ordering.
// We use CSS modules that should not care for the order of CSS imports, so we
// should be safe to ignore these.
// See: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
class CustomFilterPlugin {
  constructor({ exclude }) {
    this.exclude = exclude;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('CustomFilterPlugin', compilation => {
      // eslint-disable-next-line
      compilation.warnings = compilation.warnings.filter(
        warning => !this.exclude.test(warning.message)
      );
    });
  }
}

module.exports = withBundleAnalyzer(
  withImages(
    withGraphql(
      withSass({
        analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
        analyzeBrowser: ['browser', 'both'].includes(
          process.env.BUNDLE_ANALYZE
        ),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: 'static',
            reportFilename: '../bundles/server.html'
          },
          browser: {
            analyzerMode: 'static',
            reportFilename: '../bundles/client.html'
          }
        },
        useFileSystemPublicRoutes: false,
        webpack(config) {
          const newConfig = Object.assign({}, config);
          const envs = [
            { name: 'NODE_ENV', default: 'development' },
            'API_URL',
            'BACKEND_API_URL',
            'ANALYSIS_URL',
            'GOOGLE_ANALYTICS',
            'IS_STAGING',
            'TRANSIFEX_API_KEY',
            'GOOGLE_MAPS_API_KEY',
            'GOOGLE_RECAPTCHA_KEY'
          ];
          const definePluginOptions = {};

          envs.forEach(e => {
            const envName = typeof e === 'object' ? e.name : e;
            const envValue =
              process.env[envName] ||
              (typeof e === 'object' ? e.default : undefined);
            definePluginOptions[`process.env.${envName}`] = JSON.stringify(
              envValue
            );
          });

          newConfig.plugins.push(new webpack.DefinePlugin(definePluginOptions));
          newConfig.plugins.push(
            new CustomFilterPlugin({ exclude: /Conflicting order between:/ })
          );

          newConfig.module.rules.push({
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 100000,
                name: '[name].[ext]'
              }
            }
          });

          return newConfig;
        }
      })
    )
  )
);
