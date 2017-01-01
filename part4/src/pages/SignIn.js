import React from 'react';
import { connect } from 'react-redux';

import { signInRequested } from '../state/user';
import SignInForm from '../forms/SignInForm';

class SignIn extends React.Component {
    onSignIn = (username, password) => {
        this.props.onSignInRequested(username, password);
    }

    render() {
        return (
            <div>
                <h1>Sign In</h1>
                <SignInForm onSignIn={this.onSignIn} isFetching={this.props.isFetching} />
            </div>
        );
    }
}
SignIn.propTypes = {
    onSignInRequested: React.PropTypes.func.isRequired,
    isFetching: React.PropTypes.bool
};
const mapStateToProps = (state) => {
    return {
        isFetching: state.user.isFetching
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        onSignInRequested: (username, password) => {
            dispatch(signInRequested(username, password));
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
