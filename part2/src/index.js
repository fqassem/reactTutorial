import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import routes from './pages/routes';
import Main from './Main';

render(<AppContainer>
            <Main routes={routes}/>
        </AppContainer>,
        document.getElementById('root'));

if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./pages/routes', () => {
        const updatedRoutes = require('./pages/routes').default;
        render(
            <AppContainer>
                <Main routes={updatedRoutes} />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
