import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';

export default function createApplicationStore() {
    let middleware = [];

    if(process.env.NODE_ENV !== 'development') {
        middleware = [...middleware, thunk];
    } else {
        middleware = [...middleware, createLogger()];
    }

    const store = createStore(rootReducer, applyMiddleware(...middleware));

    if(process.env.NODE_ENV === 'development' && module.hot) {
        module.hot.accept('./rootReducer', () => {
            store.replaceReducer(require('./rootReducer').default);
        });
    }

    return store;
}
