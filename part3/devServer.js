import webpack from 'webpack';// webpack = require('webpack');
import express from 'express';
import historyApiFallback from 'connect-history-api-fallback';
import open from 'open';

import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import webpackConfig from './config/webpack.development.config';

const app = express();
const compiler = webpack(webpackConfig);

const serverConfig = {
    publicPath: webpackConfig.output.publicPath //where to serve our assets from
};

app.use(
    historyApiFallback() //route requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost', () => {
    open('http://localhost:8001', 'google chrome');
});
