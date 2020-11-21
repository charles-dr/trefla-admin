import { call, put, takeEvery } from 'redux-saga/effects';
import { POSTS_GET, POSTS_ARRIVED, POSTS_SET_PAGER } from '../actions';
import * as api from '../../api';

// fetch posts
function* fetchPosts(action) {
  const res = yield call(api.r_loadPostRequest, action.payload);
  console.log('[Saga] posts', res);
  if (res.status) {
    yield put({ type: POSTS_ARRIVED, payload: res.data });
    yield put({ type: POSTS_SET_PAGER, payload: { hasMore: res.hasMore, ...res.pager } });
  } else {
    console.log('[fetch posts] error', res.message);
  }  
}

export default function* postSaga() {
  yield takeEvery(POSTS_GET, fetchPosts);
}
