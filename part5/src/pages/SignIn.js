import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import SignInForm from '../forms/SignInForm';

class SignIn extends React.Component {
    componentWillMount() {
        if(this.props.user.role) {
            browserHistory.push('/');
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.user && (nextProps.user.role === 'USER' || nextProps.user.role === 'ADMIN')) {
            browserHistory.push('/');
        }
    }

    render() {
        return (
            <div>
                <h1>Sign In</h1>
                <SignInForm />
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
