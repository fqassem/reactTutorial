import React from 'react';
import { Link } from 'react-router';

class Container extends React.Component {
    render() {
        return (
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/signIn">Sign In</Link></li>
                    </ul>
                </nav>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node
};
export default Container;
