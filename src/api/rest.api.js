import { nodeBasicInst as basicInst } from './instance';
export * from './RestAPIs/bugs';
export * from './RestAPIs/comments';
export * from './RestAPIs/employees';
export * from './RestAPIs/identities';
export * from './RestAPIs/others';
export * from './RestAPIs/posts';
export * from './RestAPIs/reports';
export * from './RestAPIs/users';


export const r_loginRequest = async ({ email_or_name, password }) => {
  try {
    const { data: res } = await basicInst.post('/api/v1/admin/login', { email_or_name, password });
    return res;
  } catch (e) {
    console.log(e, e.response.data);
    return e.response.data;
  }
}

