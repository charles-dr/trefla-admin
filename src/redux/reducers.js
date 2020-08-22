import { combineReducers } from 'redux';
import settings from './settings/reducer';
import menu from './menu/reducer';
import auth from './auth/reducer';
import comments from './comment/reducer';
import friends from './friend/reducer';
import langs from './lang/reducer';
import posts from './posts/reducer';
import users from './users/reducer';

const reducers = combineReducers({
  menu,
  settings,
  auth,
  comments,
  friends,
  langs,
  posts,
  users,
});

export default reducers;
