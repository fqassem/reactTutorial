const webpack = require('webpack');
const express = require('express');
const path = require('path');
const historyApiFallback = require('connect-history-api-fallback');

const app = express();
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);

const serverConfig = {
    hot: true, // to enable hot loading
    publicPath: webpackConfig.output.publicPath //where to server our assets from
};

app.use(
    historyApiFallback({ //route requests through index.html
        verbose: false
    })
);
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');
