import { nodeInstance as axios } from '../instance';

export const r_loadCommentRequest = async ({ page, limit, type = 'ALL' }) => {
  try {
    const { data: res } = await axios.get('/api/v1/comment', {
      params: { page, limit, type }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteCommentByIdRequest = async (id) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/comment/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.repsonse.data;
  }
}