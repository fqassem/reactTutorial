import webpack from 'webpack';
import path from 'path';
import webpackMerge from 'webpack-merge';
import InlineManifestWebpackPlugin from 'inline-manifest-webpack-plugin';

import baseConfig from './webpack.base.config';

export default webpackMerge(baseConfig, {
    entry: {
        app: [
            path.join(__dirname, '../src/index.js')
        ]
    },
    output: {
        filename: '[name].[chunkHash:8].js',
        chunkFilename: '[name].[chunkHash:8].chunk.js',
        path: path.join(__dirname, '../dist')
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor', 'manifest'],
            minChunks: Infinity
        }),
        new InlineManifestWebpackPlugin({
            name: 'webpackManifest'
        })
    ]
});
