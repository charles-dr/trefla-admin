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
  info: { user_name: 'Admin' },
  permission: {},
  avatar: '/assets/img/no_profile.png',
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case AUTH_LOGIN_SUCCESS:
      const { status, message, data, permission } = action.payload;
      return { ...state, login: status, message, info: data || {}, permission };
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
