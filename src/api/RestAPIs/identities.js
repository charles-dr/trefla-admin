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
