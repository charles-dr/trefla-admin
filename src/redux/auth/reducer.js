import { AUTH_LOGIN_SUCCESS, AUTH_LOADING } from '../actions';

const INIT_STATE = {
    login: false,
    loading: false,
    message: ''
};

export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case AUTH_LOGIN_SUCCESS:
            const { status, message } = action.payload;
            return {...state, login: status, message: message}
        case AUTH_LOADING:
            return {...state, loading: action.payload};
        default: 
            return state;
    }
}