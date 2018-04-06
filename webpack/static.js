const webpack = require('webpack');
const path = require('path');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

const CleanPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const assetsDir = 'assets/';
const staticDir = 'static/';

const rootDir = path.resolve(__dirname, '../');
const contextDir = path.join(rootDir, assetsDir);
const outputDir = path.join(rootDir, staticDir);

const isProd = (process.env.NODE_ENV === 'production');

module.exports = {
    mode: isProd? 'production': 'development',

	context: contextDir,

    entry: {
        "index": './layouts/index.js',
        "blog-list": './layouts/blog/list.js',
        "blog-single": './layouts/blog/single.js',
        "portfolio-list": './layouts/portfolio/list.js',
        "faq-list": './layouts/faq/list.js',
        "contact-list": './layouts/contact/list.js',
        "taxonomy-list":  './layouts/taxonomy/list.js',
        "taxonomy-terms": './layouts/taxonomy/terms.js',
        "404": './layouts/404.js'
    },

    output: {
        path: outputDir,
        publicPath: '/',
        filename: 'js/[name].js',
    },

	optimization: {
        minimize: isProd? true: false,
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
				}
			}
		}
	},

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: { presets: ['babel-preset-env'] }
            }
        },
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        minimize: isProd? true: false,
                        sourceMap: true
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true,
                        plugins: function () {
                            return [
                                precss,
                                autoprefixer('last 2 versions')
                            ]
                        }
                    }
                },
                {
                    loader: 'sass-loader',
                    options: { sourceMap: true }
                }]
            })
        },
        {
            test: /\.(png|ico|gif|svg|jpe?g)(\?[a-z0-9]+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
					context: assetsDir,
                    name: '[path][name].[ext]'
                }

            },
            {
                loader: 'image-webpack-loader',
                options: {
                    // It still minifies in development mode.
                    bypassOnDebug: true
                }
            }
            ]
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: {
                loader: 'file-loader',
                options: {
                    context: assetsDir,
                    name: '[path][name].[ext]'
                }
            }
        }]
    },

    watchOptions: {
        ignored: /node_modules/
    },

    plugins: [
        new CleanPlugin([staticDir], { root: rootDir }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Popper: ['popper.js', 'default'],
            // Individual bootstrap components.
            // `Util` is always required.
            Util: 'exports-loader?Util!bootstrap/js/dist/util',
            // Optional.
            Button: 'exports-loader?Button!bootstrap/js/dist/button',
            Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
            Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown'
        }),
        new ExtractTextPlugin('css/style.css', { allChunks: false })
    ]
};
