import React from 'react';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

class Main extends React.Component {
    render() {
        return (
            <Provider store={this.props.store}>
                <Router history={browserHistory} routes={this.props.routes} />
            </Provider>
        );
    }
}
Main.propTypes = {
    routes: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired
};
export default Main;
