import { nodeInstance as axios, nodeBasicInst as basicInst } from './instance';

export const r_loginRequest = async ({ email_or_name, password }) => {
  try {
    const { data: res, status } = await basicInst.post('/api/v1/admin/login', { email_or_name, password });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

