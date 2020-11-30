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

export const r_loadAdminConfigRequest = async () => {
  try {
    const { data: res } = await axios.get('/api/v1/admin/config');
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateAdminConfigRequest = async (data) => {
  try {
    const { data: res } = await axios.patch(`api/v1/admin/config`, data);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_loadLangRequest = async ({ page, limit }) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/langs`, { params: { limit, page } });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getLangRequest = async (id) => {
  try {
    const { data: res } = await axios.get(`/api/v1/admin/langs/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_updateLangRequest = async (id, data) => {
  try {
    const { data: res } = await axios.patch(`/api/v1/admin/langs/${id}`, data);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_uploadLangFileRequest = async (code, file) => {
  try {
    let formData = new FormData();
    formData.append('file', file);
    const { data: res } = await axios.post(`/api/v1/admin/upload-lang/${code}`, formData, {
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

export const r_getLangFileContentRequest = async (id) => {
  try {
    const { data } = await axios.get(`/api/v1/admin/langs/${id}/content`);
    return data;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_createLangRequest = async (data) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/langs`, data);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_syncLangRequest = async (id) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/langs/${id}/sync`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_deleteLangRequest = async (id) => {
  try {
    const { data: res } = await axios.delete(`/api/v1/admin/langs/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_getStatsRequest = async () => {
  try {
    const { data: res } = await axios.get('/api/v1/admin/stats');
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

export const r_sendConsentEmailRequest = async (id) => {
  try {
    const { data: res } = await axios.post(`/api/v1/admin/consent-email/${id}`);
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}
