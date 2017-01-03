import React from 'react';
import { connect } from 'react-redux';

import Navbar from '../components/Navbar';

class Container extends React.Component {
    render() {
        const { userRole } = this.props;
        return (
            <div>
                <Navbar role={userRole} onSignOut={() => alert('signing out')}/>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node,
    userRole: React.PropTypes.string.isRequired
};
const mapStateToProps = (state) => {
    return {
        userRole: state.user.role
    };
};
export default connect(mapStateToProps)(Container);
