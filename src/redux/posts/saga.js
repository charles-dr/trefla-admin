import { call, put, takeEvery } from 'redux-saga/effects';
import { POSTS_GET, POSTS_ARRIVED } from '../actions';
import { getAllPosts } from '../../utils/firebase.utils';

// fetch posts
function* fetchPosts(action) {
    let posts = yield call(getAllPosts);
    // console.log('[Saga] posts', posts);
    yield put({type: POSTS_ARRIVED, payload: posts});
}

export default function* postSaga() {
    yield takeEvery(POSTS_GET, fetchPosts);
}