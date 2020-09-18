import axios from './index';

import { serialize } from '../utils';

export const sendConsentEmail = async (data) => {
  try {
    const {data: res, status} = await axios.post('/id-transfer/consent-email', data);
    console.log(res, status);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}

export const judgeIDTransferRequest = async (data) => {
  try {
    const {data: res, status} = await axios.post('/id-transfer/judge', data);
    console.log(res, status);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }  
}

export const sendSingleNotificationRequest = async (data) => {
  try {
    const {data: res, status} = await axios.post('/notification/single', data);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}

export const sendMultiNotificationsRequest = async (data) => {
  try {
    const {data: res, status} = await axios.post('/notification/bulk', data);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  } 
}



export const userTest = async () => {
  console.log('[Base Url]', process.env.REACT_APP_FUNCTIONS_ENDPOINT);
  try {
    const { data: res, status } = await axios.get('/user');
    console.log(res, status);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message,
    };
  }
};

export const getPostTableContent = async ({ start, length, order, dir }) => {
  console.log('[Table Posts]', start, length, order, dir);
  const qs = serialize({ start, length, order, dir });
  try {
    const { data: res, status } = await axios.get(`/posts?${qs}`);
    console.log(res, status);
    return res;
  } catch (e) {
    console.error(e.message);
    return {
      status: false,
      message: e.message,
    };
  }
};
