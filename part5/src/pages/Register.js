import React from 'react';
import { connect } from 'react-redux';

import RegisterForm from '../forms/RegisterForm';

class Register extends React.Component {
    render() {
        return (
            <div>
                <h1>Register</h1>
                <RegisterForm />
            </div>
        );
    }
}
Register.propTypes = {
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps)(Register);
