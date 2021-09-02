import { nodeInstance as axios, nodeBasicInst as basicInst } from '../instance';

export const r_addUserRequest = async (user) => {
  try {
    user.device_token = 'demo_token';
    const { data: res } = await basicInst.post('/api/v1/auth/register', user);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_loadUserRequest = async ({ page, limit, mode, sort, keyword }) => {
  console.log('[Req]', keyword)
  try {
    const { data: res } = await axios.get('/api/v1/user', {
      params: { page, limit, mode, sort, keyword }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getUserByIdRequest = async (user_id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/user/${user_id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateUserRequest = async (user_id, profile) => {
  try {
    const { data: res } = await axios.patch(`/api/v1/user/${user_id}`, profile);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteUserByIdRequest = async (id, option = {}) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/user/${id}`, { data: { options: option } });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.repsonse.data;
  }
}

export const r_loadIDTrasferRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/id-transfers`, { params: { page, limit } });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_IDTransferByIdRequest = async (id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/id-transfers/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteIDTransferRequest = async (id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/id-transfers/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_sendNotification2User = async ({user_id, title, body}) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/send-notification`, { user_id, title, body });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_sendNotification2Multiple = async ({user_ids, title, body}) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/bulk-notifications`, { user_ids, title, body });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}


////////////////////////////////////////
//                                    //
//         Card & Verfication         //
//                                    //
////////////////////////////////////////

export const r_loadCardRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get('/api/v1/user/card', { params: { page, limit } });
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_verifyUserRequest = async ({ id }) => {
  try {
    const { data: res } = await axios.post(`/api/v1/user/verify/${id}`);
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_unverifyUserRequest = async ({ id }) => {
  try {
    const { data: res } = await axios.post(`/api/v1/user/unverify/${id}`);
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_rejectVerificationRequest = async ({ id }) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/driver-ids/reject/${id}`);
    return res;
  } catch (e) {
    return e.response.data;
  }
}
