import Container from './Container';

if(process.env.NODE_ENV === 'development' && module.hot) {
    require('./Home');
    require('./SignIn');
    require('./Register');
    require('./EditProfile');
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
            path: 'register',
            getComponent(location, cb) {
                System.import('./Register')
                .then(loadRoute(cb, false))
                .catch(errorLoading);
            }
        },
        {
            path: 'editProfile',
            getComponent(location, cb) {
                System.import('./editProfile')
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
