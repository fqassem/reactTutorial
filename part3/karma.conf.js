module.exports = (config) => {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            'test/*.spec.js'
        ],
        exclude: [],
        preprocessors: {
            'test/*.spec.js': ['webpack']
        },
        singleRun: true,
        browsers: ['Chrome']
    });
};
