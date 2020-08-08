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