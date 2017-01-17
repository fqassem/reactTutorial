import webpack from 'webpack';
import express from 'express';
import historyApiFallback from 'connect-history-api-fallback';

import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import api from './apiServer';
import webpackConfig from './config/webpack.development.config';

const app = express();
const compiler = webpack(webpackConfig);

const serverConfig = {
    publicPath: webpackConfig.output.publicPath, //where to serve our assets from
    proxy: [{
        context: '/api',
        target: 'localhost:8002',
        pathRewrite: {
            '^/api': '/'
        }
    }]
};

app.use(
    historyApiFallback() //route requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');
api.listen(8002, 'localhost');
