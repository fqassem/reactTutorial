import webpack from 'webpack';
import express from 'express';
import historyApiFallback from 'connect-history-api-fallback';

import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import proxy from 'express-http-proxy';

import api from './apiServer';
import webpackConfig from './config/webpack.development.config';

const app = express();
const compiler = webpack(webpackConfig);

const serverConfig = {
    publicPath: webpackConfig.output.publicPath //where to serve our assets from
};

const apiProxy = proxy('http://localhost:8002/', {
    forwardPath: (req, res) => {
        return require('url').parse(req.baseUrl).path;
    }
});

app.use('/api/*', apiProxy);
app.use(
    historyApiFallback() //route requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');

api.listen(8002, 'localhost');
