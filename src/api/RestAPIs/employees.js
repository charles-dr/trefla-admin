import { nodeInstance as axios } from '../instance';
import { r_uploadFileRequest } from './others';

export const r_authenticateToken = async (token) => {
  try {
    const { data: res } = await axios.post('/api/v1/admin/authenticate-token', {});
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_addEmployeeRequest = async (profile, file) => {
  try {
    let avatar = '';
    if (file) {
      const uploadRes = await r_uploadFileRequest(file);
      if (uploadRes.status) {
        avatar = uploadRes.url;
      }
    }

    const { data: res } = await axios.post(`/api/v1/admin/employee`, { ...profile, avatar });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getEmployeeRequest = async (id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/employee/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data)
    return e.response.data;
  }
}

export const r_updateEmployeePermission = async (id, permission) => {
  try {
    const { data: res } = await axios.patch(`/api/v1/admin/employee/${id}/permission`, { permission });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_loadEmployeeRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/employee`, { params: { page, limit } });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteEmployeeRequest = async (id) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/admin/employee/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}
