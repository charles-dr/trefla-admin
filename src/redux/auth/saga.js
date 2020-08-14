import { call, put, takeEvery } from 'redux-saga/effects';
import { 
    AUTH_AVATAR,
    AUTH_AVATAR_UPDATE,
    AUTH_INFO_LOADED,
    AUTH_LOAD_INFO,
    AUTH_LOADING, 
    AUTH_LOGIN, 
    AUTH_LOGIN_CHECK, 
    AUTH_LOGIN_SUCCESS, 
    AUTH_LOGOUT } from '../actions';
import { 
    getAdminAvatarURL,
    getAdminInfo, 
    loginAdmin, 
    
    getAuthToken, 
    saveAuthToken, 
    deleteAuthToken } from '../../utils';

// fetch users
function* loginRequest(action) {
    yield put({type: AUTH_LOADING, payload: true});
    let res = yield call(loginAdmin, action.payload);
    console.log('[Saga] login', res);
    // process session data
    if (res.status === true) {
        let expire = new Date().getTime() + 3 * 60 * 60 * 1000; // 3 hours of session
        saveAuthToken(expire.toString());
    } else {
        deleteAuthToken();
    }

    yield put({type: AUTH_LOGIN_SUCCESS, payload: res});
    yield put({type: AUTH_LOADING, payload: false});
}

function* checkLogin(action) {
    const saved = getAuthToken();
    if (!!saved) {
        const now = new Date().getTime();
        if (now < Number(saved)) {
            yield put({type: AUTH_LOGIN_SUCCESS, payload: { status: true, message: '' }});
        } else {
            yield put({type: AUTH_LOGIN_SUCCESS, payload: { status: false, message: '' }});
            deleteAuthToken();
        }
    }
}

function* processLogout(action) {
    const { history } = action.payload;
    deleteAuthToken();
    yield put({type: AUTH_LOGIN_SUCCESS, payload: { status: false, message: '' }});
    history.push('/auth/login');
}

function* loadAdminProfile(action) {
    const profile = yield call(getAdminInfo);
    // delete profile.password;
    profile.password = '';
    // console.log(profile);
    yield put({type: AUTH_INFO_LOADED, payload: profile});
}

function* downloadAdminAvatar(action) {
    const url = yield call(getAdminAvatarURL);
    yield put({type: AUTH_AVATAR_UPDATE, payload: url});
}


export default function* authSaga() {
    yield takeEvery(AUTH_LOGIN, loginRequest);
    yield takeEvery(AUTH_LOGIN_CHECK, checkLogin);
    yield takeEvery(AUTH_LOGOUT, processLogout);
    yield takeEvery(AUTH_LOAD_INFO, loadAdminProfile);
    yield takeEvery(AUTH_AVATAR, downloadAdminAvatar);
}