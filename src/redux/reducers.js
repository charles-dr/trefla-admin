import { combineReducers } from 'redux';
import settings from './settings/reducer';
import menu from './menu/reducer';
import friends from './friend/reducer';
import posts from './posts/reducer';
import users from './users/reducer';

const reducers = combineReducers({
  menu,
  settings,
  friends,
  posts,
  users,
});

export default reducers;
