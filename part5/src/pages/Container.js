import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { signOut } from '../state/user';
import Navbar from '../components/Navbar';

class Container extends React.Component {
    render() {
        const { userRole } = this.props;
        return (
            <div>
                <Navbar role={userRole} onSignOut={() => this.props.signOut().then(() => browserHistory.push('/'))}/>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node,
    userRole: React.PropTypes.string.isRequired,
    signOut: React.PropTypes.func.isRequired
};
const mapStateToProps = (state) => {
    return {
        userRole: state.user.role
    };
};
export default connect(mapStateToProps, { signOut })(Container);
