import { nodeInstance as axios } from '../instance';

export const r_loadBugRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get('/api/v1/bug', {
      params: { page, limit }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateBugRequest = async (data) => {
  try {
    const { data: res } = await axios.patch(`/api/v1/bug/${data.id}`, data);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteBugRequest = async (id) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/bug/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_sendEmail2Bugger = async (id, content) => {
  try {
    const { data: res } = await axios.post(`/api/v1/bug/email/${id}`, content);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}
