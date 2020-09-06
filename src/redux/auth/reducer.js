import {
  AUTH_AVATAR_UPDATE,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOADING,
  AUTH_INFO_LOADED,
} from '../actions';

const INIT_STATE = {
  login: false,
  loading: false,
  message: '',
  info: { name: 'Admin' },
  avatar: '/assets/img/no_profile.png',
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case AUTH_LOGIN_SUCCESS:
      const { status, message } = action.payload;
      return { ...state, login: status, message };
    case AUTH_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_INFO_LOADED:
      return { ...state, info: action.payload };
    case AUTH_AVATAR_UPDATE:
      return { ...state, avatar: action.payload };
    default:
      return state;
  }
};
