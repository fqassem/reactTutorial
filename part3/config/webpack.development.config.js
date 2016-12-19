import webpack from 'webpack';
import path from 'path';
import webpackMerge from 'webpack-merge';

import baseConfig from './webpack.base.config';

export default webpackMerge(baseConfig, {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        app: [
             // activate HMR for React
            'react-hot-loader/patch',
            //connect to the server to receive notifications when the bundle rebuilds
            'webpack-hot-middleware/client',
            //main app entry
            path.join(__dirname, '../src/index.js')
        ]
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dev')
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
});
