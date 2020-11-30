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

export const r_loadEmailTemplateRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/email-templates`, { params: { page, limit }});
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getEmailTemplateByIdRequest = async (id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/email-templates/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateEmailTemplateRequest = async (id, data) => {
  try {
    const { data: res } = await axios.patch(`/api/v1/admin/email-templates/${id}`, data);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getProfileRequest = async () => {
  try {
    const { data: res } = await axios.get('/api/v1/admin/profile');
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateProfileRequest = async (profile, file) => {
  try {
    let avatar = '';
    if (file) {
      const uploadRes = await r_uploadFileRequest(file);
      if (uploadRes.status) {
        avatar = uploadRes.url;
      }
    }

    const { data: res } = await axios.patch(`/api/v1/admin/profile`, { ...profile, avatar });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updatePasswordRequest = async (data) => {
  try {
    const { data: res } = await axios.patch('/api/v1/admin/update-password', data);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}
