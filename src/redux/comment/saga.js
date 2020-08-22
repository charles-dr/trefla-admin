import { call, put, takeEvery } from 'redux-saga/effects';
import { COMMENTS_GET, COMMENTS_ARRIVED } from '../actions';
import { getAllComments } from '../../utils/firebase.utils';

// fetch posts
function* fetchComments(action) {
    let comments = yield call(getAllComments);
    // console.log('[Saga] posts', posts);
    yield put({type: COMMENTS_ARRIVED, payload: comments});
}

export default function* postSaga() {
    yield takeEvery(COMMENTS_GET, fetchComments);
}