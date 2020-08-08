import { combineReducers } from 'redux';
import settings from './settings/reducer';
import menu from './menu/reducer';
import users from './users/reducer';
import posts from './posts/reducer';

const reducers = combineReducers({
  menu,
  settings,
  users,
  posts,
});

export default reducers;
