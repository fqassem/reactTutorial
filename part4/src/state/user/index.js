import InitialUserState from './InitialUserState';

//Action constants
export const SIGN_IN_REQUESTED = 'SIGN_IN_REQUESTED';
export const SIGN_IN_SUCCESSFUL = 'SIGN_IN_SUCCESSFUL';
export const SIGN_IN_FAILED = 'SIGN_IN_FAILED';

//Action creators
export const signInRequested = (username, password) => {
    return { type: SIGN_IN_REQUESTED, username, password };
};

export const signInSuccessful = (userData) => {
    return { type: SIGN_IN_SUCCESSFUL, userData };
};

export const signInFailed = (error) => {
    return { type: SIGN_IN_FAILED, error };
};

export const signIn = (username, password) => {
    return (dispatch) => {
        alert('toot');
        setTimeout(dispatch(signInRequested()), 1000);
        setTimeout(dispatch(signInSuccessful()), 2000);
    };
};

//Reducer
export default (state = InitialUserState, action) => {
    switch(action.type) {
        case SIGN_IN_REQUESTED: {
            alert('ho');
            return Object.assign({}, state, { isFetching: true, error: null });
        }
        case SIGN_IN_SUCCESSFUL: {
            alert('hey');
            const userData = action.userData;
            return Object.assign({}, state, { isFetching: false, error: null, userData });
        }
        case SIGN_IN_FAILED: {
            const error = action.error;
            return Object.assign({}, state, { isFetching: false, error });
        }
        default:
            return state;
    }
};
