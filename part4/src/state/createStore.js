import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';

export default function createApplicationStore() {
    let middleware = [thunk];

    if(process.env.NODE_ENV !== 'development') {
        middleware = [...middleware];
    } else {
        middleware = [...middleware, createLogger()];
    }

    const store = createStore(rootReducer, applyMiddleware(...middleware));

    if(process.env.NODE_ENV === 'development' && module.hot) {
        module.hot.accept('./rootReducer', () => {
            const nextReducer = require('./rootReducer').default;
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}
