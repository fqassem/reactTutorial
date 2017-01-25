import React from 'react';
import { connect } from 'react-redux';

class Home extends React.Component {
    render() {
        const { user } = this.props;
        return (
            <div>
                <h1>Home</h1>
                {user.role && <p>Welcome, {user.username}</p>}
            </div>
        );
    }
}
Home.propTypes = {
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps)(Home);
