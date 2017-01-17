import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: {
        vendor: ['react', 'react-dom', 'react-router', 'babel-polyfill']
    },
    output: {
        publicPath: '/'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js)$/,
                include: /src/,
                loader: 'eslint-loader'
            },
            {
                test: /\.(js)$/,
                include: /src/,
                loaders: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.EnvironmentPlugin([
            'NODE_ENV'
        ]),
        new webpack.NoErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '../index.ejs'),
            filename: 'index.html',
            inject: true
        })
    ]
};
