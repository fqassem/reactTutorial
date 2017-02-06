import React from 'react';
import { Field, reduxForm, propTypes } from 'redux-form';
import { connect } from 'react-redux';

import { editProfile } from '../state/user';

class EditProfileForm extends React.Component {
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
            <form onSubmit={handleSubmit(editProfile)}>
                { submitting && <div>Loading gif</div> }
                { error && <div>{ error }</div> }
                <div>
                    <Field name="firstName" label="First Name" type="text" component={this.renderField} />
                </div>
                <div>
                    <Field name="lastName" label="Last Name" type="text" component={this.renderField} />
                </div>
                <div>
                    <Field name="email" label="Email" type="text" component={this.renderField} />
                </div>
                <button type="submit" disabled={pristine || submitting}>Edit Profile</button>
            </form>
        );
    }
}
EditProfileForm.propTypes = {
    ...propTypes
};
let EditProfileReduxForm = reduxForm({ form: 'editProfileForm' })(EditProfileForm);
export default EditProfileReduxForm = connect(
  state => ({
      initialValues: state.user
  })
)(EditProfileReduxForm);
