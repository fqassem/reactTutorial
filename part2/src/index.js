import React from 'react';
import { Router, browserHistory } from 'react-router';
import { render } from 'react-dom';

import routes from './pages/routes';

class Main extends React.Component {
    render() {
        return (
            <Router history={browserHistory} routes={routes} />
        );
    }
}
render(<Main/>, document.getElementById('root'));
