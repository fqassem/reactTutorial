import React from 'react';
import { Field, reduxForm, propTypes } from 'redux-form';

import { register } from '../state/user';

class RegisterForm extends React.Component {
    renderField = ({ input, label, type, meta: { touched, error } }) => {
        return (
            <div>
                <label>{label}</label>
                <div>
                    <input {...input} placeholder={label} type={type} />
                    {touched && error && <span>{error}</span>}
                </div>
            </div>
        );
    };

    render() {
        const { handleSubmit, pristine, submitting, error } = this.props;
        return (
            <form onSubmit={handleSubmit(register)}>
                { submitting && <div>Loading gif</div> }
                { error && <div>{ error }</div> }
                <div>
                    <Field name="username" label="Username" type="text" component={this.renderField} />
                </div>
                <div>
                    <Field name="firstName" label="First Name" type="text" component={this.renderField} />
                </div>
                <div>
                    <Field name="lastName" label="Last Name" type="text" component={this.renderField} />
                </div>
                <div>
                    <Field name="email" label="Email" type="text" component={this.renderField} />
                </div>
                <div>
                    <Field name="password" label="Password" type="password" component={this.renderField} />
                </div>
                <button type="submit" disabled={pristine || submitting}>Register</button>
            </form>
        );
    }
}
RegisterForm.propTypes = {
    ...propTypes
};
export default reduxForm({ form: 'registerForm' })(RegisterForm);
