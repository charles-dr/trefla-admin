import { nodeInstance as axios } from '../instance';

export const r_createPostRequest = async (data) => {
  try {
    const { data: res } = await axios.post('/api/v1/post', data);
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_loadPostRequest = async ({ page, limit, type = 'ALL' }) => {
  try {
    const { data: res } = await axios.get('/api/v1/post', {
      params: { page, limit, type }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getPostByIdRequest = async (post_id) => {
  try {
    const { data: res } = await axios.get(`api/v1/post/${post_id}`);
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_updatePostRequest = async (id, post) => {
  try {
    const { data: res } = await axios.patch(`api/v1/post/${id}`, post);
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_deletePostByIdRequest = async (id) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/post/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.repsonse.data;
  }
}