/* eslint-disable import/no-cycle */
/* SETTINGS */
export const CHANGE_LOCALE = 'CHANGE_LOCALE';

/* AUTH */
export const LOGIN_USER = 'LOGIN_USER';
export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
export const LOGIN_USER_ERROR = 'LOGIN_USER_ERROR';
export const REGISTER_USER = 'REGISTER_USER';
export const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';
export const REGISTER_USER_ERROR = 'REGISTER_USER_ERROR';
export const LOGOUT_USER = 'LOGOUT_USER';
export const FORGOT_PASSWORD = 'FORGOT_PASSWORD';
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS';
export const FORGOT_PASSWORD_ERROR = 'FORGOT_PASSWORD_ERROR';
export const RESET_PASSWORD = 'RESET_PASSWORD';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_ERROR = 'RESET_PASSWORD_ERROR';

/* MENU */
export const MENU_SET_CLASSNAMES = 'MENU_SET_CLASSNAMES';
export const MENU_CONTAINER_ADD_CLASSNAME = 'MENU_CONTAINER_ADD_CLASSNAME';
export const MENU_CLICK_MOBILE_MENU = 'MENU_CLICK_MOBILE_MENU';
export const MENU_CHANGE_DEFAULT_CLASSES = 'MENU_CHANGE_DEFAULT_CLASSES';
export const MENU_CHANGE_HAS_SUB_ITEM_STATUS =
  'MENU_CHANGE_HAS_SUB_ITEM_STATUS';

export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const AUTH_LOGIN_CHECK = 'AUTH_LOGIN_CHECK';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_LOAD_INFO = 'AUTH_LOAD_INFO';
export const AUTH_INFO_LOADED = 'AUTH_INFO_LOADED';
export const AUTH_AVATAR = 'AUTH_AVATAR';
export const AUTH_AVATAR_UPDATE = 'AUTH_AVATAR_UPDATE';


export const FRIEND_GET = 'FRIEND_GET';
export const FRIEND_ARRIVED = 'FRIEND_ARRIVED';

export const LANG_GET = 'LANG_GET';
export const LANG_ARRIVED = 'LANG_ARRIVED';

export const POSTS_GET = 'POSTS_GET';
export const POSTS_ARRIVED = 'POSTS_ARRIVED';

export const USERS_GET = 'USERS_GET';
export const USERS_ARRIVED = 'USERS_ARRIVED';

export * from './menu/actions';
export * from './settings/actions';

export * from './auth/actions';
export * from './friend/actions';
export * from './lang/actions';
export * from './posts/actions';
export * from './users/actions';
