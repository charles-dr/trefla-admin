import { all } from 'redux-saga/effects';
// import authSagas from './auth/saga';
import friendSasga from './friend/saga';
import postSaga from './posts/saga';
import userSaga from './users/saga';

export default function* rootSaga(getState) {
  yield all([
    // authSagas(),
    friendSasga(),
    postSaga(),
    userSaga()
  ]);
}
