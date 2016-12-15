import Container from './Container';

if(process.env.NODE_ENV === 'development' && module.hot) {
    require('./Home');
    require('./ContactUs');
}

function errorLoading(error) {
    throw new Error(`Dynamic page loading failed: ${error}`);
}

function loadRoute(cb) {
    return module => cb(null, module.default);
}

export default {
    path: '/', // at index '/', the <Core /> component will be loaded
    component: Container,
    indexRoute: { // but we also want our indexRoute to load <Home />
        getComponent(location, cb) {
            System.import('./Home')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }
    },
    childRoutes: [
        {
            path: 'contactUs',
            getComponent(location, cb) {
                System.import('./ContactUs')
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
