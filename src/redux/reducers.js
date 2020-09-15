import { combineReducers } from 'redux';
import settings from './settings/reducer';
import menu from './menu/reducer';

import adminNotifications from './admin-notification/reducer';
import auth from './auth/reducer';
import comments from './comment/reducer';
import emailTemplates from './email-template/reducer';
import friends from './friend/reducer';
import langs from './lang/reducer';
import posts from './posts/reducer';
import reports from './reports/reducer';
import users from './users/reducer';

const reducers = combineReducers({
  menu,
  settings,

  adminNotifications,
  auth,
  comments,
  emailTemplates,
  friends,
  langs,
  posts,
  reports,
  users,
});

export default reducers;
