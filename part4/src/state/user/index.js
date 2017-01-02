import InitialUserState from './InitialUserState';

//Action constants
export const SET_USER_DATA = 'SET_USER_DATA';

//Actions
export const setUserData = (userData) => {
    return { type: SET_USER_DATA, userData };
};

export const signIn = (credentials) => {
    return (dispatch) => {
        return new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    if(credentials.username !== 'fail') {
                        dispatch(setUserData({}));
                        resolve();
                    } else {
                        reject(Error('Bad Creds'));
                    }
                }, 2000);
            }
        );
    };
};

//Reducer
export default (state = InitialUserState, action) => {
    switch(action.type) {
        case SET_USER_DATA: {
            const userData = action.userData;
            return Object.assign({}, state, { ...userData });
        }
        default:
            return state;
    }
};
