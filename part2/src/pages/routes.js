import Container from './Container';

if(process.env.NODE_ENV === 'development' && module.hot) {
    require('./Home');
    require('./SignIn');
}

function errorLoading(error) {
    throw new Error(`Dynamic page loading failed: ${error}`);
}

function loadRoute(cb) {
    return module => cb(null, module.default);
}

export default {
    path: '/',
    component: Container,
    indexRoute: {
        getComponent(location, cb) {
            System.import('./Home')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }
    },
    childRoutes: [
        {
            path: 'signIn',
            getComponent(location, cb) {
                System.import('./SignIn')
                .then(loadRoute(cb, false))
                .catch(errorLoading);
            }
        },
        {
            path: '*',
            getComponent(location, cb) {
                System.import('./Home')
                .then(loadRoute(cb))
                .catch(errorLoading);
            }
        }
    ]
};
