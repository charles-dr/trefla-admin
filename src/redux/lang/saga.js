import { call, put, takeEvery } from 'redux-saga/effects';
import { LANG_GET, LANG_ARRIVED } from '../actions';
import { getAllLangRequest } from '../../utils/firebase.utils';

// fetch posts
function* fetchLangs(action) {
  const langs = yield call(getAllLangRequest);
  // console.log(langs);
  yield put({ type: LANG_ARRIVED, payload: langs });
}

export default function* postSaga() {
  yield takeEvery(LANG_GET, fetchLangs);
}
