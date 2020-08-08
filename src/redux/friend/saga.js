import { call, put, takeEvery } from 'redux-saga/effects';
import { FRIEND_GET, FRIEND_ARRIVED } from '../actions';
import { getAllFriends } from '../../utils/firebase.utils';

// fetch users
function* fetchFriends(action) {
    let friends = yield call(getAllFriends);
    console.log('[Saga] friends', friends);
    yield put({type: FRIEND_ARRIVED, payload: friends});
}

export default function* friendSaga() {
    yield takeEvery(FRIEND_GET, fetchFriends);
}