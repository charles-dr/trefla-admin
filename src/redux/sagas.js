import { all } from 'redux-saga/effects';
// import authSagas from './auth/saga';

import adminNotiSaga from './admin-notification/saga';
import authSaga from './auth/saga';
import commentSage from './comment/saga';
import emailTemplateSaga from './email-template/saga';
import friendSaga from './friend/saga';
import langSaga from './lang/saga';
import postSaga from './posts/saga';
import reportSaga from './reports/saga.js';
import userSaga from './users/saga';

export default function* rootSaga(getState) {
  yield all([
    adminNotiSaga(),
    authSaga(),
    commentSage(),
    emailTemplateSaga(),
    friendSaga(),
    langSaga(),
    postSaga(),
    reportSaga(),
    userSaga(),
  ]);
}
