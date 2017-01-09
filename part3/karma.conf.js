module.exports = (config) => {
    config.set({
        //Our framework list
        frameworks: ['mocha', 'chai', 'sinon'],
        //Our test files glob
        files: [
            'test/**/*.spec.js'
        ],
        //Use webpack and sourcemap to preprocess our files
        preprocessors: {
            'test/**/*.spec.js': ['webpack', 'sourcemap']
        },
        //Our testing webpack configuration
        webpack: {
            devtool: 'inline-source-map',
            module: {
                loaders: [
                    { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
                ]
            },
            resolve: {
                alias: { sinon: 'sinon/pkg/sinon' } // https://github.com/webpack/webpack/issues/177#issuecomment-185718237
            },
            //necessary for Enzyme to work
            //https://github.com/airbnb/enzyme/blob/master/docs/guides/karma.md#enzyme--karma--webpack
            externals: {
                cheerio: 'window',
                'react/addons': true,
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': true
            }
        },
        //Run our tests just once, if set to false then karma will watch our test files and re-run tests on changes
        singleRun: true,
        //Use Chrome for our browser test environment
        browsers: ['Chrome']
    });
};
