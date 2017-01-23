import React from 'react';
import { Router, browserHistory } from 'react-router';

class Main extends React.Component {
    render() {
        return (
            <Router history={browserHistory} routes={this.props.routes} />
        );
    }
}
Main.propTypes = {
    routes: React.PropTypes.object.isRequired
};
export default Main;
