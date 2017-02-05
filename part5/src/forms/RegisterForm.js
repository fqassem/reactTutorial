import React from 'react';
import { Field, reduxForm, propTypes } from 'redux-form';
import { connect } from 'react-redux';

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
                    <Field name="firstName" label="First Name" type="text" />
                </div>
                <button type="submit" disabled={pristine || submitting} >Sign In</button>
            </form>
        );
    }
}
RegisterForm.propTypes = {
    ...propTypes
};
let RegisterReduxForm = reduxForm({ form: 'registerForm' })(RegisterForm);
export default RegisterReduxForm = connect(
  state => ({
      initialValues: state.user
  })
)(RegisterReduxForm);
