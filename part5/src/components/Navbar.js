import React from 'react';
import { Link } from 'react-router';

import { GUEST, MEMBER } from '../constants/Roles';

class Navbar extends React.Component {
    createRoleBasedNavbar = (role) => {
        const { onSignOut } = this.props;
        switch(role) {
            case MEMBER:
                return (
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link onClick={() => onSignOut()}>Sign Out</Link></li>
                    </ul>
                );
            case GUEST:
            default:
                return (
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/register">Register</Link></li>
                        <li><Link to="/signIn">Sign In</Link></li>
                    </ul>
                );
        }
    }

    render() {
        const { role } = this.props;
        return (
            <nav>
                { this.createRoleBasedNavbar(role)}
            </nav>
        );
    }
}
Navbar.propTypes = {
    role: React.PropTypes.string.isRequired,
    onSignOut: React.PropTypes.func.isRequired
};
export default Navbar;
