import { call, put, takeEvery } from 'redux-saga/effects';
import { USERS_GET, USERS_ARRIVED } from '../actions';
import { getAllUsers } from '../../utils/firebase.utils';

// fetch users
function* fetchUsers(action) {
  const users = yield call(getAllUsers);
  // console.log('[Saga] users', users);
  yield put({ type: USERS_ARRIVED, payload: users });
}

export default function* userSaga() {
  yield takeEvery(USERS_GET, fetchUsers);
}
