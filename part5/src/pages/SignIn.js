import React from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';
import { signIn } from '../state/user';
import SignInForm from '../forms/SignInForm';

class SignIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetching: false,
            error: null
        };
    }

    componentWillMount() {
        if(this.props.user.role !== 'GUEST') { //forward already signed-in users
            browserHistory.push('/');
        }
    }

    onSignIn = (username, password) => {
        const credentials = { username, password };

        this.setState({ isFetching: true, error: null });
        this.props.signIn(credentials)
            .then(() => this.setState({ isFetching: false }))
            .then(() => browserHistory.push('/'))
            .catch(error => this.setState({ isFetching: false, error }));
    }

    render() {
        const { isFetching, error } = this.state;
        return (
            <div>
                <h1>Sign In</h1>
                <SignInForm onSignIn={this.onSignIn} isFetching={isFetching} error={error}/>
            </div>
        );
    }
}
SignIn.propTypes = {
    signIn: React.PropTypes.func.isRequired,
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps, { signIn })(SignIn);
