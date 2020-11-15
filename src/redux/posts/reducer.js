import { 
  POSTS_ARRIVED,
  POSTS_SET_PAGER
} from '../actions';

const INIT_STATE = {
  list: [],
  pager: {
    last_id: null,
    limit: 10,
    type: 'ALL'
  },
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case POSTS_ARRIVED:
      return { ...state, list: action.payload };
    case POSTS_SET_PAGER:
      return { ...state, pager: action.payload };
    default:
      return state;
  }
};
