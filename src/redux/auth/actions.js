import { AUTH_LOADING, AUTH_LOGIN, AUTH_LOGIN_SUCCESS, AUTH_LOGIN_CHECK, AUTH_LOGOUT }
    from '../actions';

export const setAuthLoading = loading => ({
    type: AUTH_LOADING, payload: loading
});

export const updateLogin = ({status, message}) => ({
    type: AUTH_LOGIN_SUCCESS, payload: {status, message}
})

export const login = (data) => ({
    type: AUTH_LOGIN, payload: data
})

export const checkLoginSession = () => ({
    type: AUTH_LOGIN_CHECK
})

export const logout = (data) => ({
    type: AUTH_LOGOUT, payload: data
})