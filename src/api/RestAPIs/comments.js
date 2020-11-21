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

export const r_getCommentByIdRequest = async (comment_id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/comment/${comment_id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateCommentRequest = async (comment) => {
  try {
    const { data: res } = await axios.patch(`/api/v1/comment/${comment.id}`, comment);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteCommentByIdRequest = async (id) => {
  try {
    const res = await axios.delete(`/api/v1/comment/${id}`);
    return res.data;
  } catch (e) {
    return e.response.data;
  }
}