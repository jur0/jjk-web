const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const { URL } = require('url');

const CleanPlugin = require('clean-webpack-plugin');
const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default;
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const assetsDir = 'public/';
const distDir = 'dist/';

const rootDir = path.resolve(__dirname, '../');
const contextDir = path.join(rootDir, assetsDir);
const outputDir = path.join(rootDir, distDir);

const htmlEntries = getEntries();

const baseUrl = process.env.BASE_URL;

function baseUrlPath(url) {
    return new URL(url).pathname;
}

function getEntries() {
    var result = glob.sync('**/*.html', {
        cwd: assetsDir,
        nodir: true,
        nosort: true
    });
	return result
		.map((file) => {
			return {
				name: file,
				path: './' + file
			}
		}).reduce((memo, file) => {
			memo[file.name] = file.path
			return memo;
		}, {})
}

function htmlEntriesPlugins(htmlEntries) {
    var plugins = [];
    const htmlFiles = Object.keys(htmlEntries);
    const htmlTemplates = Object.values(htmlEntries);

    for (var i in htmlFiles) {
        plugins.push(
            new HtmlPlugin({
                filename: htmlFiles[i],
                template: htmlTemplates[i],
                minify: {
                    collapseWhitespace: true,
                    removeComments: true
                }
            })
        )
    }
    return plugins;
}

module.exports = {
	mode: 'production',

    context: contextDir,

    // Each html has its own entry. It is loaded with html-loader and some
    // attributes are replaced with correct names (with hashes).
    entry: htmlEntries,

	output: {
		path: outputDir,
		publicPath: baseUrlPath(baseUrl),
		// Unfortunately webpack creates js output. It will be supressed using
		// SuppressChunksPlugin.
		filename: '[name]'
	},

	module: {
		rules: [{
			test: /\.html$/i,
			use: [{
                loader: 'html-loader',
                options: {
                    root: contextDir,
                    // This will replace content of attributes with
                    // what is defined in loaders and prepend 'output.publicPath'.
                    // Once an assets is read in defined attribute, coresponding
                    // loader is used for the given asset e.g. css -> file-loader.
                    attrs: [
                        'link:href',
                        'script:src',
                        'img:src'
                    ]
                }
            }]
		},
        {
            test: /\.js$/,
            use: [{
                loader: 'spawn-loader',
                options: {
                    name: 'js/[name].min.[hash:8].js'
                }
            }]
        },
        {
            test: /\.css$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[path][name].min.[hash:8].css'
                }
            }]
        },
        {
            test: /\.(png|ico|gif|svg|jpe?g)(\?[a-z0-9]+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[path][name].[hash:8].[ext]'
                }
            }]
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: {
                loader: 'file-loader',
                options: {
                    name: '[path][name].[hash:8].[ext]'
                }
            }
        }]
	},

	plugins: [
	    new CleanPlugin([distDir], { root: rootDir }),
	    new SuppressChunksPlugin(Object.keys(htmlEntries)),
	    // Copy what hasn't been processed by loaders yet (xml, txt, ...).
	    new CopyPlugin([{
	        from: '**/*',
            // Ignore assets processed by loaders above.
            ignore: [
                '*.html',
                '*.js',
                '*.css',
                '*.{png,ico,gif,svg,jpeg,jpg}',
                '*.{woff,woff2,eot,ttf,otf}'
            ]
        }])
	].concat(htmlEntriesPlugins(htmlEntries))
};
