const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: [
            'webpack-hot-middleware/client?path=/__webpack_hmr',
            path.join(__dirname, './src')
        ]
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, './build'),
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            filename: 'index.html',
            inject: 'body'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                include: /src/,
                loader: 'babel-loader'
            }
        ]
    }
}
