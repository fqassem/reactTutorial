import React from 'react';

class SignInForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    onSignIn = (event) => {
        const { username, password } = this.state;
        event.preventDefault();

        this.props.onSignIn(username, password); //call the passed in onSignIn function
    }

    handleUsernameChange = (event) => {
        const newUsername = event.target.value;
        this.setState({
            username: newUsername
        });
    }

    handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        this.setState({
            password: newPassword
        });
    }

    render() {
        const { username, password } = this.state;
        const { isFetching, error } = this.props;
        return (
            <form onSubmit={this.onSignIn}>
                { isFetching && <div>Loading gif</div> }
                { error && <div>{error.message}</div> }
                <div>
                    <label>Username</label>
                    <input type="text" placeholder="Username" name="username"
                      onChange={this.handleUsernameChange} value={username}/>

                    <label>Password</label>
                    <input type="password" placeholder="Password" name="password"
                      onChange={this.handlePasswordChange} value={password}/>

                    <button type="submit">Sign In</button>
                </div>
            </form>
        );
    }
}
SignInForm.propTypes = {
    onSignIn: React.PropTypes.func.isRequired,
    isFetching: React.PropTypes.bool,
    error: React.PropTypes.object
};
export default SignInForm;
