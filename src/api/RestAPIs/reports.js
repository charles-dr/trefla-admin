import { nodeInstance as axios } from '../instance';

export const r_loadReportRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get('/api/v1/report', {
      params: { page, limit }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteReportRequest = async (id) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/report/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_sendEmail2Reporter = async (id, content) => {
  try {
    const { data: res } = await axios.post(`/api/v1/report/email/${id}`, content);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

