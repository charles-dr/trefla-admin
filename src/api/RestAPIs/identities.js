import { nodeInstance as axios } from '../instance';

export const r_loadIdentityRequest = async ({ page, limit, sort }) => {
  try {
    const { data: res } = await axios.get('/api/v1/admin/identities', {
      params: { page, limit, sort }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_verifyIdentityRequest = async ({ id }) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/identities/${id}/verify`);
    return res;
  } catch (e) {
    return e.response.data;
  }
}

export const r_unverifyIdentityRequest = async ({ id }) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/identities/${id}/unverify`);
    return res;
  } catch (e) {
    return e.response.data;
  }
}
