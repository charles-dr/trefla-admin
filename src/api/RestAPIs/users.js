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

export const r_loadUserRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get('/api/v1/user', {
      params: { page, limit }
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

