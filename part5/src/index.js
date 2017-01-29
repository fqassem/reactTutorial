import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import createStore from './state/createStore';
import routes from './pages/routes';
import Main from './Main';

const store = createStore();
const rootElement = document.getElementById('root');

render(<AppContainer>
            <Main routes={routes} store={store} />
        </AppContainer>,
        rootElement);

if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./pages/routes', () => {
        const updatedRoutes = require('./pages/routes').default;
        render(
            <AppContainer>
                <Main routes={updatedRoutes} store={store} />
            </AppContainer>,
            rootElement
        );
    });
}
