import React from 'react';
import { connect } from 'react-redux';

import SignInForm from '../forms/SignInForm';

class SignIn extends React.Component {
    render() {
        return (
            <div>
                <h1>Sign In</h1>
                <SignInForm/>
            </div>
        );
    }
}
SignIn.propTypes = {
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps)(SignIn);
