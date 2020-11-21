import { POSTS_GET } from '../actions';

export const loadAllPosts = (payload) => ({
  type: POSTS_GET,
  payload,
});
