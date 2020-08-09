import CryptoJS from "crypto-js";

const getAuthTokenName = () => {
  return 'TREFLAADMIN_TOKEN';
}

export const serialize = function (obj) {
  const str = [];
  for (const p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  return str.join('&');
};

export const transformTime = (str_time) => {
    const arr1 = str_time.split(':');
    const date_arr = arr1[0].split('-');
    const dt = new Date(Number(date_arr[0]), Number(date_arr[1]) - 1, Number(date_arr[2]), Number(date_arr[3]), Number(date_arr[4]), Number(date_arr[5]));

    const my_timezone = -dt.getTimezoneOffset();
    const time = dt.getTime();

    const timezoneOffset = Number(arr1[1]);

    const final_time = time - (my_timezone - timezoneOffset) * 60 * 1000;

    const dt_final = new Date(final_time);
    return str_time.substring(0, 10) + " " + dt_final.toLocaleTimeString();    
}

export const getAuthToken = () => {
  const encToken = window.localStorage.getItem(getAuthTokenName());
  return !!encToken ? decryptString(encToken) : '';
}

export const saveAuthToken = (token) => {
  if (!token) return;
  console.log('[Auth Util] save', token);
  const encToken = encryptString(token);
  window.localStorage.setItem(getAuthTokenName(), encToken);
}

export const deleteAuthToken = () => {
  console.log('[Auth Util] delete');
  localStorage.removeItem(getAuthTokenName());
}

export const encryptString = (src) => {
  return CryptoJS.AES.encrypt(src, process.env.REACT_APP_SECRET).toString();
}

export const decryptString = (src) => {
  let temp = CryptoJS.AES.decrypt(src, process.env.REACT_APP_SECRET);
  return temp.toString(CryptoJS.enc.Utf8)
}