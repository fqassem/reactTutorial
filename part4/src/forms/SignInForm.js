import React from 'react';

class SignInForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            usernameError: false,
            passwordError: false,
            submitError: false
        };
    }

    onSignIn = (event) => {
        const { username, password, usernameError, passwordError } = this.state;
        event.preventDefault();

        //if(!usernameError && !passwordError) {
            this.props.onSignIn(username, password);
        //}
    }

    handleUsernameChange = (event) => {
        const newUsername = event.target.value;
        this.setState({
            usernameError: newUsername.length === 0,
            username: newUsername
        });
    }

    handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        this.setState({
            passwordError: newPassword.length === 0,
            password: newPassword
        });
    }

    render() {
        const { username, password, usernameError, passwordError, submitError, isFetching } = this.state;
        return (
            <form onSubmit={this.onSignIn}>
                { isFetching && <div>Loading gif</div> }
                { submitError && <div>Your username or password was invalid</div> }
                <div>
                    <label>Username</label>
                    <input type="text" placeholder="Username" name="username"
                      onChange={this.handleUsernameChange} value={username}/>
                    { usernameError && <div>Your username should not be blank </div> }

                    <label>Password</label>
                    <input type="password" placeholder="Password" name="password"
                      onChange={this.handlePasswordChange} value={password}/>
                    { passwordError && <div>Your password should not be blank</div> }

                    <button type="submit">Sign In</button>
                </div>
            </form>
        );
    }
}
SignInForm.propTypes = {
    onSignIn: React.PropTypes.func.isRequired
};
export default SignInForm;
