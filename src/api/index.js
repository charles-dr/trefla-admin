import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_FUNCTIONS_ENDPOINT,
  headers: {
    // 'Authorization': {
    //   toString() {
    //     return `Bearer ${getAuthToken()}`
    //   }
    // },
    'Content-Type': 'application/json',
    // 'X-Requested-With': 'TheBikeComp',
    // 'Custom-Header': 'Hey'
  },
});

export default instance;
