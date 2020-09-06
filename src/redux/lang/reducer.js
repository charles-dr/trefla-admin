import { LANG_ARRIVED } from '../actions';

const INIT_STATE = {
  list: [],
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case LANG_ARRIVED:
      return { ...state, list: action.payload };
    default:
      return state;
  }
};
