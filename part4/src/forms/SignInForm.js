import React from 'react';
import { Field, reduxForm, propTypes } from 'redux-form';

import { signIn } from '../state/user';

class SignInForm extends React.Component {
    renderField = ({ input, label, type, meta: { touched, error } }) => {
        return (
            <div>
                <label>{label}</label>
                <div>
                    <input {...input} placeholder={label} type={type}/>
                    {touched && error && <span>{error}</span>}
                </div>
            </div>
        );
    };

    render() {
        const { handleSubmit, pristine, submitting, error } = this.props;
        return (
            <form onSubmit={handleSubmit(signIn)}>
                { submitting && <div>Loading gif</div> }
                { error && <div>Sign In Failed</div> }
                <div>
                    <Field name="username" label="Username" type="text" component={this.renderField}/>
                </div>
                <div>
                    <Field name="password" label="Password" type="password" component={this.renderField}/>
                </div>
                <button type="submit" disabled={pristine || submitting} >Sign In</button>
            </form>
        );
    }
}
const validate = (values) => {
    const errors = {};

    if(!values.username) {
        errors.username = 'Please enter a username';
    }

    if(!values.password) {
        errors.password = 'Please enter a password';
    }
    return errors;
};
SignInForm.propTypes = {
    ...propTypes
};
export default reduxForm({ form: 'signInForm', validate })(SignInForm);
