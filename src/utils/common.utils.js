import CryptoJS from 'crypto-js';

const getAuthTokenName = () => {
  return 'TREFLAADMIN_TOKENREST';
};

export const serialize = function (obj) {
  const str = [];
  for (const p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  return str.join('&');
};

// YYYY-mm-dd-HH-ii-ss:tz -> YYYY-mm-dd HH:ii:ss
export const transformTime = (str_time) => {
  const arr1 = str_time.split(':');
  const date_arr = arr1[0].split('-');
  const dt = new Date(
    Number(date_arr[0]),
    Number(date_arr[1]) - 1,
    Number(date_arr[2]),
    Number(date_arr[3]),
    Number(date_arr[4]),
    Number(date_arr[5])
  );

  const my_timezone = -dt.getTimezoneOffset();
  const time = dt.getTime();

  const timezoneOffset = Number(arr1[1]);

  const final_time = time - (my_timezone - timezoneOffset) * 60 * 1000;

  const dt_final = new Date(final_time);
  return `${str_time.substring(0, 10)} ${dt_final.toLocaleTimeString()}`;
};

// Date() -> Y-m-d-H-i-s:tz
export const convertTimeToString = (dt) => {
  if (!dt) {
    dt = new Date();
  }

  const y = dt.getFullYear();
  const m = formatTwoDigits(dt.getMonth() + 1);
  const d = formatTwoDigits(dt.getDate());
  const H = formatTwoDigits(dt.getHours());
  const i = formatTwoDigits(dt.getMinutes());
  const s = formatTwoDigits(dt.getSeconds());
  const tz = -dt.getTimezoneOffset();
  return `${y}-${m}-${d}-${H}-${i}-${s}:${tz}`;
};

export const formatTime = (dt, format) => {
  if (!dt) {
    dt = new Date();
  }

  const y = dt.getFullYear();
  const m = formatTwoDigits(dt.getMonth() + 1);
  const d = formatTwoDigits(dt.getDate());
  const H = formatTwoDigits(dt.getHours());
  const i = formatTwoDigits(dt.getMinutes());
  const s = formatTwoDigits(dt.getSeconds());
  // const tz = -dt.getTimezoneOffset();

  let formatted = format;
  formatted = formatted.replace(/Y/g, y);
  formatted = formatted.replace('m', m);
  formatted = formatted.replace('d', d);
  formatted = formatted.replace('H', H);
  formatted = formatted.replace('i', i);
  formatted = formatted.replace('s', s);
  return formatted;
};

export const getAuthToken = () => {
  const encToken = window.localStorage.getItem(getAuthTokenName());
  return encToken ? decryptString(encToken) : '';
};

export const saveAuthToken = (token) => {
  if (!token) return;
  console.log('[Auth Util] save', token);
  const encToken = encryptString(token);
  window.localStorage.setItem(getAuthTokenName(), encToken);
};

export const deleteAuthToken = () => {
  console.log('[Auth Util] delete');
  localStorage.removeItem(getAuthTokenName());
};

export const encryptString = (src) => {
  return CryptoJS.AES.encrypt(src, process.env.REACT_APP_SECRET).toString();
};

export const decryptString = (src) => {
  const temp = CryptoJS.AES.decrypt(src, process.env.REACT_APP_SECRET);
  return temp.toString(CryptoJS.enc.Utf8);
};

export const formatTwoDigits = (num) => {
  return num > 9 ? num : `0${num}`;
};

export const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {
      const { status } = xhr;

      if (status === 200) {
        resolve(xhr.response);
        // callback(null, xhr.response);
      } else {
        // callback(status);
        reject(false);
      }
    };

    xhr.onerror = function (err) {
      console.error(err);
      reject(false);
    };

    xhr.send();
  });
};

export const getMapPositionFromString = (str) => {
  if (str) {
    const tArray = str.split(',');
    if (tArray.length === 2) {
      return {
        lat: Number(tArray[0]),
        lng: Number(tArray[1]),
      };
    }
    return { lat: 0, lng: 0 };
  }
  return { lat: 0, lng: 0 };
};

export const moderateString = (str, len) => {
  return str.length > len ? `${str.substr(0, len)}...` : str;
};

export const toCamelCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const menuPermission = ({ role, permission }, strKey = '') => {
  if (role === 'SUPER_ADMIN') return true;
  const keys = strKey.split('.');
  if (keys.length === 1) {
    return permission[keys[0]];
  } else if (keys.length === 2) {
    return permission[keys[0]][keys[1]];
  } else if (keys.length === 3) {
    return permission[keys[0]][keys[1]][keys[2]];
  } else if (keys.length === 4) {
    return permission[keys[0]][keys[1]][keys[2]][keys[3]];
  }
  return false;
}
