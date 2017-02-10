import React from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';

import { clearUserData } from '../state/user';
import AuthenticationService from '../services/AuthenticationService';

class Container extends React.Component {
    render() {
        const { user } = this.props;
        return (
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        { !user.role && <li><Link to="/signIn">Sign In</Link></li> }
                        { !user.role && <li><Link to="/register">Register</Link></li> }
                        { user.role && <li><Link to="/editProfile">Edit Profile</Link></li> }
                        { user.role && <li><button onClick={this.props.signOut}>Sign Out</button></li> }
                    </ul>
                </nav>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node,
    user: React.PropTypes.object,
    signOut: React.PropTypes.func
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        signOut: () => {
            dispatch(clearUserData({}));
            AuthenticationService.removeToken();
            browserHistory.push('/');
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Container);
