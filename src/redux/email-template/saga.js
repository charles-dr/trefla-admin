import { call, put, takeEvery } from 'redux-saga/effects';
import { EMAIL_TEMPLATE_GET, EMAIL_TEMPLATE_ARRIVED } from '../actions';
import { loadEmailTemplatesRequest } from '../../utils/firebase.utils';

// fetch posts
function* fetchEmailTemplates(action) {
  const eTemplates = yield call(loadEmailTemplatesRequest);
  // console.log(langs);
  yield put({ type: EMAIL_TEMPLATE_ARRIVED, payload: eTemplates });
}

export default function* postSaga() {
  yield takeEvery(EMAIL_TEMPLATE_GET, fetchEmailTemplates);
}
