import { nodeInstance as axios } from '../instance';

export const r_uploadFileRequest = async (file) => {
  try {
    let formData = new FormData();
    formData.append('file', file);
    const { data: res } = await axios.post('/api/v1/photo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}