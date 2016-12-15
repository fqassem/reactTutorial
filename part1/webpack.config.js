import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: {
        app: [
            'react-hot-loader/patch',
            'webpack-hot-middleware/client',
            path.join(__dirname, './src')
        ]
    },
    output: {
        filename: '[name].[hash].js',
        publicPath: '/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
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
};
