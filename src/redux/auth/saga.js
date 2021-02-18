import { call, put, takeEvery } from 'redux-saga/effects';
import jwt_decode from "jwt-decode";
import * as api from '../../api';
import {
  AUTH_AVATAR,
  AUTH_AVATAR_UPDATE,
  AUTH_INFO_LOADED,
  AUTH_LOAD_INFO,
  AUTH_LOADING,
  AUTH_LOGIN,
  AUTH_LOGIN_CHECK,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGOUT,
} from '../actions';
import {
  getAdminAvatarURL,
  getAdminInfo,
  loginAdmin,
  getAuthToken,
  saveAuthToken,
  deleteAuthToken,
} from '../../utils';

function* loginRequest(action) {
  yield put({ type: AUTH_LOADING, payload: true });
  const res = yield call(api.r_loginRequest, action.payload);
  // process session data
  if (res.status === true) {
    saveAuthToken(res.token);
  } else {
    deleteAuthToken();
  }

  yield put({ type: AUTH_LOGIN_SUCCESS, payload: res });
  yield put({ type: AUTH_LOADING, payload: false });
}

function* checkLogin(action) {
  try {
    const saved = getAuthToken();
    if (!saved) {
      yield put({
        type: AUTH_LOGIN_SUCCESS,
        payload: { status: false, message: "" },
      });
      return;
    }
    else {
      const decoded = jwt_decode(saved);
      const now = new Date().getTime();
      if (now < decoded.exp * 1000) {
        const res = yield call(api.r_authenticateToken, saved);
        if (res.status) {
          yield put({
            type: AUTH_LOGIN_SUCCESS,
            payload: res, //{ status: true, message: '' },
          });
        } else {
          
          throw Object.assign(new Error(res.message), { code: 400 });
        }
      } else {
        console.log('[Token][Expired]')
        throw Object.assign(new Error('Token is expired'), { code: 400 });
      }
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: AUTH_LOGIN_SUCCESS,
      payload: { status: false, message: e.message },
    });
    deleteAuthToken();    
  }
}

function* processLogout(action) {
  const { history } = action.payload;
  deleteAuthToken();
  yield put({
    type: AUTH_LOGIN_SUCCESS,
    payload: { status: false, message: '' },
  });
  history.push('/auth/login');
}

function* loadAdminProfile(action) {
  const profile = yield call(getAdminInfo);
  // delete profile.password;
  profile.password = '';
  // console.log(profile);
  yield put({ type: AUTH_INFO_LOADED, payload: profile });
}

function* downloadAdminAvatar(action) {
  const url = yield call(getAdminAvatarURL);
  yield put({ type: AUTH_AVATAR_UPDATE, payload: url });
}

export default function* authSaga() {
  yield takeEvery(AUTH_LOGIN, loginRequest);
  yield takeEvery(AUTH_LOGIN_CHECK, checkLogin);
  yield takeEvery(AUTH_LOGOUT, processLogout);
  yield takeEvery(AUTH_LOAD_INFO, loadAdminProfile);
  yield takeEvery(AUTH_AVATAR, downloadAdminAvatar);
}
