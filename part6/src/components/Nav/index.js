import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';

const NavWrapper = styled.nav`
  font-weight: bold;
`;

const NavList = styled.ul`
  list-style: none;
  padding-right: 25px;
`;

const NavListElement = styled.li`
  display: inline-block;
  padding-right: 10px;
`;

const NavLink = styled(Link)`
  color: green;
`;

const Nav = ({ role, signOut }) => (
    <NavWrapper>
      <NavList>
        <NavListElement><NavLink to="/">Home</NavLink></NavListElement>
        { !role && <NavListElement><NavLink to="/signIn">Sign In</NavLink></NavListElement> }
        { !role && <NavListElement><NavLink to="/register">Register</NavLink></NavListElement> }
        { role && <NavListElement><NavLink to="/editProfile">Edit Profile</NavLink></NavListElement> }
        { role && <NavListElement><button onClick={signOut}>Sign Out</button></NavListElement> }
      </NavList>
    </NavWrapper>
);

Nav.propTypes = {
    role: React.PropTypes.string.isRequired,
    signOut: React.PropTypes.func
};

export default Nav;
