import { call, put, takeEvery } from 'redux-saga/effects';
import { ADMIN_NOTI_GET, ADMIN_NOTI_ARRIVED } from '../actions';
import { loadAdminNotificationRequest } from '../../utils/firebase.utils';

// fetch posts
function* fetchAdminNotifications(action) {
  const adminNotis = yield call(loadAdminNotificationRequest);
  console.log(adminNotis);
  yield put({ type: ADMIN_NOTI_ARRIVED, payload: adminNotis });
}

export default function* postSaga() {
  yield takeEvery(ADMIN_NOTI_GET, fetchAdminNotifications);
}
