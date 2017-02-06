import { SubmissionError } from 'redux-form';
import { browserHistory } from 'react-router';

import AuthenticationService from '../../services/AuthenticationService';
import InitialUserState from './InitialUserState';

//Action constants
export const SET_USER_DATA = 'SET_USER_DATA';
export const CLEAR_USER_DATA = 'SIGN_OUT';

//Actions
export const setUserData = (userData) => {
    return { type: SET_USER_DATA, userData };
};

export const clearUserData = () => {
    return { type: CLEAR_USER_DATA };
};

//Async Action
export const signIn = (values, dispatch) => {
    const { username, password } = values;

    return AuthenticationService.signIn(username, password)
    .then((response) => {
        if(response.ok) {
            response.json().then((json) => {
                dispatch(setUserData(json.userData));
                AuthenticationService.storeToken(json.token);
            });
        } else {
            throw new SubmissionError({ _error: 'Invalid Credentials' });
        }
    });
};

export const register = (userInfo) => {
    return AuthenticationService.register(userInfo)
    .then((response) => {
        if(response.ok) {
            browserHistory.push('/signIn');
        } else {
            throw new SubmissionError({ _error: 'Registration Error' });
        }
    });
};

export const editProfile = (values, dispatch) => {
    const { userInfo, token } = values;

    return AuthenticationService.editProfile(userInfo, token)
    .then((response) => {
        if(response.ok) {
            response.json().then((json) => {
                dispatch(setUserData(json.userData));
            });
        } else {
            throw new SubmissionError({ _error: 'Edit Profile Error' });
        }
    });
};

//Reducer
export default (state = InitialUserState, action) => {
    switch(action.type) {
        case SET_USER_DATA: {
            const userData = action.userData;
            return { ...state, ...userData };
        }
        case CLEAR_USER_DATA: {
            return InitialUserState;
        }
        default:
            return state;
    }
};
