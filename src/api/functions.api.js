import { firebaseInstance as axios } from './instance';

import { serialize } from '../utils';

export const backupDBRequest = async () => {
  try {
    const {data: res} = await axios.post('/firestore/export', {});
    return res;
  } catch (e) {
    return {
      status: false, message: e.message
    }
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

export const verifyUserByIdRequest = async (user_id) => {
  try {
    const { data: res, status } = await axios.post('/id-card/verify-user', {user_id});
    console.log(res, status);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}

export const unverifyUserByIdRequest = async (user_id) => {
  try {
    const { data: res, status } = await axios.post('/id-card/unverify-user', {user_id});
    console.log(res, status);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}

export const restoreBackupReqeust = async (id) => {
  try {
    const { data: res } = await axios.post('/firestore/import', {id});
    return res;
  } catch (e) {
    return {
      status: false, message: e.message
    };
  }
}

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

export const sendMultiNotificationsRequest = async (data) => {
  try {
    const { data: res } = await axios.post('/notification/bulk', data);
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
    const { data: res } = await axios.post('/notification/single', data);
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
