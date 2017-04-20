import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import Nav from '../components/Nav';
import { clearUserData } from '../state/user';
import AuthenticationService from '../services/AuthenticationService';

class Container extends React.Component {
    render() {
        const { user, signOut } = this.props;
        return (
            <div>
                <Nav role={user.role} signOut={signOut}/>
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
