import React from 'react';
import { connect } from 'react-redux';

import EditProfileForm from '../forms/EditProfileForm';

class EditProfile extends React.Component {
    render() {
        return (
            <div>
                <h1>Edit Profile</h1>
                <EditProfileForm />
            </div>
        );
    }
}
EditProfile.propTypes = {
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps)(EditProfile);
