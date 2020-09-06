import { call, put, takeEvery } from 'redux-saga/effects';
import { REPORTS_GET, REPORTS_ARRIVED } from '../actions';
import { getAllReports } from '../../utils/firebase.utils';

// fetch reports
function* fetchReports(action) {
  const reports = yield call(getAllReports);
  // console.log('[Saga] reports', reports);
  yield put({ type: REPORTS_ARRIVED, payload: reports });
}

export default function* postSaga() {
  yield takeEvery(REPORTS_GET, fetchReports);
}
