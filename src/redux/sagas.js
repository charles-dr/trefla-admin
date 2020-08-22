import { all } from 'redux-saga/effects';
// import authSagas from './auth/saga';
import authSaga from './auth/saga';
import commentSage from './comment/saga';
import friendSasga from './friend/saga';
import langSaga from './lang/saga';
import postSaga from './posts/saga';
import userSaga from './users/saga';

export default function* rootSaga(getState) {
  yield all([
    authSaga(),
    commentSage(),
    friendSasga(),
    langSaga(),
    postSaga(),
    userSaga()
  ]);
}
