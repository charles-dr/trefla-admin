import axios from 'axios';
import { getAuthToken } from '../utils';

const firebaseInstance = axios.create({
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

const nodeInstance = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
  headers: {
    'Authorization': {
      toString() {
        return `Bearer ${getAuthToken()}`
      }
    },
    'Content-Type': 'application/json',
    // 'X-Requested-With': 'TheBikeComp',
    // 'Custom-Header': 'Hey'
  },
});

const nodeBasicInst = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
  headers: {
    'Authorization': {
      toString() {
        const pair = `${process.env.REACT_APP_BASIC_USERNAME}:api123V1$$!`;
        // console.log(btoa(pair));
        return `Basic ${btoa(pair)}`;
      }
    }
  }
});

export { firebaseInstance, nodeInstance, nodeBasicInst };
